# Deployment Guide for Lyrics Translator (VPS)

## Overview

Diese Anleitung beschreibt, wie du die Lyrics Translator Applikation auf einem VPS mit Docker Compose deployst.

**Stack:**

- Frontend: Next.js 16 (Port 3000)
- Backend: Spring Boot (Port 8088)
- Database: PostgreSQL 15 (Port 5432)
- Reverse Proxy: Caddy 2 (Port 80/443 für SSL/TLS)

---

## Schritt 1: VPS vorbereiten

### Anforderungen

- Linux VPS (Ubuntu 20.04+ empfohlen)
- Docker und Docker Compose installiert
- Mindestens 2GB RAM, 10GB Speicher
- Domain registriert und auf VPS zeigend (für SSL)

### Docker & Docker Compose installieren

```bash
# Update System
sudo apt update && sudo apt upgrade -y

# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose installieren
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Benutzer zu docker-Gruppe hinzufügen (optional)
sudo usermod -aG docker $USER
newgrp docker

# Versionen überprüfen
docker --version
docker-compose --version
```

---

## Schritt 2: Repository klonen und vorbereiten

```bash
# Ins Home-Verzeichnis wechseln
cd ~

# Repository klonen
git clone https://github.com/yourusername/lyricsTranslator.git
cd lyricsTranslator

# Umgebungsvariablen vorbereiten
cp .env.production.example .env

# Editor öffnen und Werte anpassen
nano .env
```

### Wichtige `.env` Variablen für Production

```bash
# Sicherheit
JWT_SECRET=<use: openssl rand -base64 32>
POSTGRES_PASSWORD=<strong-password-min-20-chars>

# Domain
NEXT_PUBLIC_API_URL=https://yourdomain.com
APP_FRONTEND_URL=https://yourdomain.com

# Mail (für Passwort-Reset)
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=app-password

# Optional: Backend Port (wenn nicht Standard 8088)
BACKEND_PORT=8088
FRONTEND_PORT=3000
```

### Caddyfile konfigurieren

```bash
nano Caddyfile
```

Ersetze `yourdomain.com` mit deiner tatsächlichen Domain:

```caddy
yourdomain.com {
	route / {
		reverse_proxy frontend:3000
	}
	route /api/* {
		reverse_proxy backend:8088
	}
}
```

---

## Schritt 3: Ports freigeben (Firewall)

```bash
# UFW (Uncomplicated Firewall)
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP (Caddy)
sudo ufw allow 443/tcp     # HTTPS (Caddy)
sudo ufw enable

# Oder mit iptables (falls kein UFW)
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

---

## Schritt 4: Docker-Compose starten

```bash
# Bilder bauen und Container starten
docker-compose up -d

# Status überprüfen
docker-compose ps

# Logs anschauen
docker-compose logs -f

# Spezifische Logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

**Startup-Zeit:** ~1-2 Minuten (erstes Bauen dauert länger)

---

## Schritt 5: Validierung

```bash
# Database verbindung prüfen
docker-compose exec db psql -U nachweise_user -d nachweise_db -c "SELECT 1"

# Backend Health Check
curl http://localhost:8088/actuator/health

# Frontend aufrufen
curl -I http://localhost:3000

# Reverse Proxy testen (nach Caddy-Start)
curl -I https://yourdomain.com
```

---

## Laufende Verwaltung

### Container neu starten

```bash
docker-compose restart
docker-compose restart backend  # Nur Backend
```

### Container stoppen

```bash
docker-compose stop
```

### Container löschen (Daten bleiben)

```bash
docker-compose down
```

### Container löschen (mit Daten löschen)

```bash
docker-compose down -v
```

### Logs anschauen

```bash
docker-compose logs --tail=100 -f backend
docker-compose logs --tail=100 -f frontend
```

### In Container ausführen

```bash
# Shell im Backend-Container
docker-compose exec backend bash

# Datenbank-Abfrage
docker-compose exec db psql -U nachweise_user -d nachweise_db
```

---

## Updates und Wartung

### Code aktualisieren

```bash
git pull origin main
docker-compose up -d --build
```

### Nur Images updaten (ohne Code-Änderungen)

```bash
docker-compose pull
docker-compose up -d
```

### Docker-Speicherplatz bereinigen

```bash
docker system prune -a
docker volume prune
```

---

## Fehlerbehandlung

### "Port already in use"

```bash
# Prozess finden, der den Port nutzt
sudo lsof -i :8088
# Oder Docker-Container mit bestehenden Ports stoppen
docker ps  # Finde den Container
docker stop <container-id>
```

### "Connection refused" von Frontend zu Backend

- Überprüfe: `NEXT_PUBLIC_API_URL` in `.env`
- Überprüfe: `APP_FRONTEND_URL` in `.env`
- Backend-Logs: `docker-compose logs backend`

### Caddy SSL-Zertifikat Probleme

```bash
# Caddy Logs überprüfen
docker-compose logs caddy

# Caddy Config neu laden
docker-compose restart caddy

# Manuell Certificate prüfen
docker-compose exec caddy caddy list-modules
```

### Datenbank verbindungsprobleme

```bash
# Datenbank Status
docker-compose logs db

# Datenbank neustarten
docker-compose restart db

# Alle Daten zurücksetzen (ACHTUNG!)
docker-compose down -v
docker-compose up -d
```

---

## Performance & Sicherheit

### JVM Memory anpassen (für große Auswirkungen)

In `.env`:

```bash
JAVA_OPTS=-Xmx2048m -Xms1024m  # Für 4GB+ RAM Server
```

### PostgreSQL Backup erstellen

```bash
docker-compose exec db pg_dump -U nachweise_user nachweise_db > backup_$(date +%Y%m%d).sql
```

### PostgreSQL Backup wiederherstellen

```bash
docker-compose exec -T db psql -U nachweise_user nachweise_db < backup_20250101.sql
```

### SSL/TLS Zertifikate (Auto mit Caddy)

- Caddy holt automatisch Let's Encrypt Zertifikate
- Zertifikate gespeichert in: `caddy_config` Volume
- Automatische Erneuerung 30 Tage vor Ablauf

---

## Troubleshooting Commands

```bash
# Alle relevanten Infos sammeln
docker-compose ps
docker-compose logs -f
docker stats

# Container inspizieren
docker inspect lyrics-backend

# Netzwerk prüfen
docker network inspect lyrics-network

# Verzeichnisse prüfen
docker-compose exec backend ls -la /app/uploads
docker-compose exec backend ls -la /app/generated_pdfs
```

---

## Rollback zu vorheriger Version

```bash
# Letzten Commit auschecken
git log --oneline
git checkout <commit-hash>

# Neu bauen und starten
docker-compose up -d --build
```

---

## Weitere Ressourcen

- [Docker Compose Dokumentation](https://docs.docker.com/compose/)
- [Caddy Dokumentation](https://caddyserver.com/docs/)
- [Spring Boot Production Guide](https://spring.io/guides/gs/spring-boot/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## Support & Kontakt

Bei Problemen überprüfe:

1. `.env` Datei Konfiguration
2. Docker und Docker Compose Version
3. Firewall-Regeln
4. Server-Ressourcen (RAM, Disk, CPU)
5. DNS-Einstellungen für deine Domain
