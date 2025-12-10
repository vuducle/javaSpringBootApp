# Caddy Reverse Proxy Configuration

Diese Verzeichnis enthält Konfigurationsvorlagen für Caddy 2 - einen modernen, benutzerfreundlichen Web-Server mit automatischem HTTPS.

## 📁 Dateien

### `Caddyfile.example`

**Produktions-Konfiguration** mit:

- ✅ Automatisches HTTPS via Let's Encrypt
- 🔒 Sicherheits-Header (HSTS, X-Frame-Options, etc.)
- 🎯 Frontend & Backend Routing
- 📊 Gzip-Kompression
- 📝 Logging-Konfiguration

**Verwendung:**

```bash
cp Caddyfile.example Caddyfile
nano Caddyfile  # Domain und Email anpassen
```

### `Caddyfile.local`

**Entwicklungs-Konfiguration** mit:

- 🚀 HTTP nur (kein SSL)
- 🔄 WebSocket-Support für Next.js HMR
- 📋 JSON-Logging zu stdout
- 🐳 Optimiert für docker-compose

**Verwendung:**

```bash
cp Caddyfile.local Caddyfile
docker-compose up  # Automatisch geladen
```

## 🔧 Setup

### Production (mit SSL)

1. **Domain vorbereiten**

   ```bash
   # Stelle sicher, dass deine Domain auf den VPS zeigt
   nslookup example.com
   ```

2. **Caddyfile konfigurieren**

   ```bash
   cp Caddyfile.example Caddyfile
   ```

3. **Domain & Email anpassen**

   ```
   # In Caddyfile ändern:
   example.com {
     tls admin@example.com  # ← Deine Domain und Email
     ...
   }
   ```

4. **Docker Compose starten**

   ```bash
   docker-compose up -d
   ```

5. **Zertifikat verifizieren**
   ```bash
   # Nach ~10 Sekunden sollte SSL aktiv sein
   curl -I https://example.com
   ```

### Lokale Entwicklung (ohne SSL)

```bash
cp Caddyfile.local Caddyfile
docker-compose up -d
```

Dann öffnen:

- **Frontend:** http://localhost
- **API:** http://localhost/api

## 🎯 Routing-Regeln

### Production (`Caddyfile.example`)

```
example.com
├── /api/*           → backend:8088 (Spring Boot)
└── /*               → frontend:3000 (Next.js)
```

### Optional: Separate API-Domain

Aktiviere diese Blöcke in `Caddyfile.example` um separate Domains zu nutzen:

```
api.example.com     → backend:8088
example.com         → frontend:3000
```

Dies ermöglicht bessere:

- 📊 Analyse und Monitoring pro Service
- 🔄 Unabhängige Skalierung
- 🔐 Granulare Sicherheits-Policies

## 🔒 Sicherheits-Features

### Header (automatisch in Caddyfile.example)

| Header                      | Zweck                    | Wert                            |
| --------------------------- | ------------------------ | ------------------------------- |
| `Strict-Transport-Security` | HTTPS erzwingen          | 1 Jahr                          |
| `X-Content-Type-Options`    | MIME-Sniffing verhindern | nosniff                         |
| `X-Frame-Options`           | Clickjacking verhindern  | SAMEORIGIN                      |
| `X-XSS-Protection`          | XSS-Schutz               | enabled                         |
| `Referrer-Policy`           | Referrer-Info limitieren | strict-origin-when-cross-origin |

### Automatisches HTTPS

- 🔄 Caddy beantragt automatisch SSL-Zertifikate von Let's Encrypt
- 🔁 Erneuert Zertifikate automatisch vor Ablauf
- ↩️ HTTP → HTTPS Redirect ist automatisch aktiviert

## 🐛 Troubleshooting

### "Connection refused" bei http://localhost:3000

**Problem:** Frontend nicht über Caddy erreichbar

```bash
# Lösung: Verwende Caddyfile.local
cp Caddyfile.local Caddyfile
docker-compose restart caddy
```

### SSL-Zertifikat wird nicht aktualisiert

```bash
# Caddy Logs prüfen
docker-compose logs caddy

# Zertifikat-Status
docker-compose exec caddy caddy list-certificates

# Neue Zertifikate erzwingen
docker-compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### Backend-Anfragen schlagen fehl

```bash
# 1. Backend läuft?
docker-compose exec backend curl http://localhost:8088/actuator/health

# 2. Firewall-Regeln
docker-compose logs backend

# 3. Environment-Variablen prüfen
docker-compose exec backend env | grep SPRING
```

### "TLS handshake failure"

**Problem:** Domain zeigt nicht auf VPS oder DNS nicht aktualisiert

```bash
# DNS prüfen
nslookup example.com

# Sollte IP deines VPS sein
# Wenn nicht: DNS-Einstellungen aktualisieren und warten (bis 24h)

# Dann Caddy neu starten
docker-compose restart caddy
```

## 📊 Monitoring

### Live Logs anschauen

```bash
docker-compose logs -f caddy
```

### Health-Status prüfen

```bash
curl http://localhost:2019/config/  # Caddy Admin API
```

### Metriken (optional)

```bash
# Prometheus-Metriken aktivieren in Caddyfile
# (erfordert zusätzliche Plugins)
```

## 🔄 Konfiguration neu laden

Ohne Downtime neue Konfiguration laden:

```bash
# Methode 1: Über docker-compose (empfohlen)
docker-compose exec caddy caddy reload \
  --config /etc/caddy/Caddyfile

# Methode 2: Kompletter Restart
docker-compose restart caddy
```

## 📚 Weitere Ressourcen

- [Caddy Dokumentation](https://caddyserver.com/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [HTTP Security Headers](https://securityheaders.com/)

## ✅ Checkliste für Production

- [ ] Domain registriert und konfiguriert
- [ ] DNS zeigt auf VPS-IP
- [ ] `Caddyfile` erstellt aus `Caddyfile.example`
- [ ] Domain und Email in Caddyfile eingetragen
- [ ] Port 80 und 443 in Firewall freigegeben
- [ ] docker-compose.yml Caddyfile-Mount korrekt
- [ ] SSL-Zertifikat erfolgreich generiert
- [ ] HTTPS funktioniert: `curl https://example.com`
- [ ] Backend-Anfragen funktionieren
- [ ] Logs werden überwacht

---

**Happy proxying! 🚀**
