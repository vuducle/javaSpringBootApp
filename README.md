# 📋 Nachweise für Azubis & Ausbilder

Eine moderne Full-Stack-Anwendung zur Verwaltung und Genehmigung von Ausbildungsnachweisen für Auszubildende und Ausbilder/innen.

**Live-Demo:** https://example.com (nach Deployment)

---

## 🎯 Features

### Für Auszubildende (Azubis)

- ✅ **Nachweise erstellen** - Dokumentation täglicher Ausbildungsaufgaben
- 📋 **PDF generieren** - Automatische PDF-Erstellung von Nachweisen
- 📊 **Status überwachen** - Echtzeit-Übersicht über eingereichte Nachweise
- 🔄 **Nachweise bearbeiten** - Abgelehnte Nachweise nachbessern und erneut einreichen
- 👤 **Profil verwalten** - Persönliche Daten und Profilbild aktualisieren
- 🔒 **Passwort ändern** - Sichere Passwort-Verwaltung
- 📦 **Batch-Export** - Mehrere Nachweise als ZIP-Archiv herunterladen
- 🗑️ **Batch-Löschung** - Mehrere Nachweise gleichzeitig löschen
- 🔔 **E-Mail-Benachrichtigungen** - Automatische Updates bei Statusänderungen

### Für Ausbilder/innen (Trainer)

- 📑 **Nachweise prüfen** - Detaillierte Überprüfung eingereicherter Nachweise
- ✔️ **Status setzen** - Genehmigen oder ablehnen mit Kommentar
- 💬 **Feedback geben** - Kommentarfunktion für konstruktives Feedback
- 📊 **Dashboard** - Statistische Übersicht aller Nachweise
- 👥 **Azubis verwalten** - Zuordnung von Azubis zum Ausbilder
- ⚡ **Batch-Genehmigung** - Mehrere Nachweise gleichzeitig genehmigen
- ❌ **Batch-Ablehnung** - Mehrere Nachweise gleichzeitig ablehnen
- 📧 **Automatische E-Mails** - PDFs werden automatisch an Azubis gesendet

### Für Administratoren

- 🔑 **Benutzerverwaltung** - Erstellen, bearbeiten, löschen von Benutzern
- 👨‍💼 **Rollenverwaltung** - Azubi & Ausbilder-Rollen zuweisen
- 📝 **Audit-Logs** - Nachverfolgung aller Aktionen im System
- ⚙️ **Systemverwaltung** - Konfiguration und Überwachung
- 📦 **Batch-Operationen** - Massenbearbeitung von Nachweisen

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────┐
│                    Caddy (Reverse Proxy)            │
│                    Port 80/443 (SSL/TLS)            │
└────────────────┬──────────────────┬────────────────┘
                 │                  │
         ┌───────▼────┐     ┌───────▼────────┐
         │  Frontend   │     │    Backend     │
         │  Next.js    │     │  Spring Boot   │
         │  Port 3000  │     │   Port 8088    │
         └────────────┘     └───────┬────────┘
                                    │
                            ┌───────▼──────┐
                            │  PostgreSQL  │
                            │  Port 5432   │
                            └──────────────┘
```

**Stack:**

- **Frontend:** Next.js 16 (React, TypeScript, Tailwind CSS)
- **Backend:** Spring Boot 3 (Java, Jakarta EE, Gradle)
- **Database:** PostgreSQL 15
- **Reverse Proxy:** Caddy 2 (SSL/TLS, CORS)
- **Containerization:** Docker & Docker Compose

---

## 🚀 Quick Start

### Voraussetzungen

- Docker & Docker Compose installiert
- Git
- (Optional) IDE wie VS Code oder IntelliJ

### 1. Repository klonen

```bash
git clone https://github.com/yourusername/lyricsTranslator.git
cd lyricsTranslator
```

### 2. Umgebungsvariablen konfigurieren

```bash
# Für lokale Entwicklung
cp .env.example .env

# Oder für Production
cp .env.production.example .env
nano .env  # Anpassen nach Bedarf
```

### 3. Docker Compose starten

```bash
docker-compose up -d
```

### 4. Anwendung öffnen

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8088
- **Database:** localhost:5432

---

## 📖 Dokumentation

### Deployment auf VPS

Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für ausführliche Anweisungen:

- VPS vorbereiten
- Docker installieren
- Environment-Variablen setzen
- Docker Compose starten
- Firewall konfigurieren
- SSL/TLS mit Caddy

### Backend API

Siehe [backend/README.md](./backend/README.md) für:

- API-Endpoints
- Authentifizierung (JWT)
- Datenbank-Schema
- Build & Test

### Frontend

Siehe [client-nachweise/README.md](./client-nachweise/README.md) für:

- Komponenten-Übersicht
- Store/Redux Setup
- Styling mit Tailwind
- Build & Development

---

## 🔧 Konfiguration

### Environment-Variablen

**Datenbankverbindung**

```bash
POSTGRES_DB=nachweise_db
POSTGRES_USER=nachweise_user
POSTGRES_PASSWORD=<strong-password>
```

**Spring Boot Backend**

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/nachweise_db
SERVER_PORT=8088
JWT_SECRET=<32+-character-secret>
```

**Frontend**

```bash
NEXT_PUBLIC_API_URL=http://localhost:8088
NODE_ENV=development
```

**Mail (für Passwort-Reset)**

```bash
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=app-password
```

Siehe `.env.example` und `.env.production.example` für alle Optionen.

---

## 🛠️ Development

### Frontend entwickeln

```bash
cd client-nachweise
npm install
npm run dev
# http://localhost:3000
```

### Backend entwickeln

```bash
cd backend
./gradlew bootRun
# http://localhost:8088
```

### Datenbank-Migrations

```bash
# Automatisch via Hibernate (update-Modus)
# Oder manuell mit SQL-Scripts in javaMusicApp/src/main/resources/db
```

---

## 🧪 Tests

### Frontend Tests

```bash
cd client-nachweise
npm run lint
npm run test  # (bei Implementierung)
```

### Backend Tests

```bash
cd javaMusicApp
./gradlew test
```

---

## 🔐 Sicherheit

- ✅ JWT-basierte Authentifizierung
- ✅ CORS-Konfiguration
- ✅ Passwort-Hashing (bcrypt)
- ✅ SQL-Injection-Protection (Parameterized Queries)
- ✅ SSL/TLS via Caddy
- ✅ Secure HTTP Headers
- ⚠️ Admin-Funktionen (nur Ausbilder/Admin)

**Wichtig für Production:**

- `JWT_SECRET` auf starken Wert setzen
- `POSTGRES_PASSWORD` auf starkes Passwort setzen
- Firewall richtig konfigurieren
- Regelmäßige Backups erstellen
- Logs überwachen

---

## 📊 API-Übersicht

### Authentication

- `POST /api/auth/login` - Anmelden
- `POST /api/auth/register` - Registrierung
- `POST /api/auth/refresh` - Token aktualisieren
- `POST /api/auth/forgot-password` - Passwort zurücksetzen

### Nachweise

- `GET /api/nachweise` - Eigene Nachweise abrufen
- `POST /api/nachweise` - Neuen Nachweis erstellen
- `PUT /api/nachweise/{id}` - Nachweis aktualisieren
- `DELETE /api/nachweise/{id}` - Nachweis löschen
- `GET /api/nachweise/{id}/pdf` - PDF herunterladen
- `POST /api/nachweise/batch-export` - Mehrere Nachweise als ZIP herunterladen
- `POST /api/nachweise/batch-delete` - Mehrere Nachweise löschen
- `PUT /api/nachweise/batch-status` - Batch-Statusänderung (Admin)

### Admin

- `GET /api/user` - Alle Benutzer abrufen
- `POST /api/user` - Benutzer erstellen
- `PUT /api/user/{id}` - Benutzer aktualisieren
- `DELETE /api/user/{id}` - Benutzer löschen

Vollständige API-Dokumentation siehe [backend/USER_API_DOCUMENTATION.md](./backend/USER_API_DOCUMENTATION.md)

---

## 🐛 Troubleshooting

### Container starten nicht

```bash
docker-compose logs -f
docker system prune -a  # Docker-Cache löschen
```

### Datenbank-Fehler

```bash
docker-compose exec db psql -U nachweise_user -d nachweise_db
docker-compose down -v  # Daten löschen und neu starten
```

### Frontend kann Backend nicht erreichen

- Überprüfe: `NEXT_PUBLIC_API_URL` in `.env`
- Überprüfe: Backend-Logs mit `docker-compose logs backend`
- Überprüfe: Firewall-Regeln

---

## 📝 Lizenz

Dieses Projekt ist [MIT](LICENSE) lizenziert.

---

## 🎓 Bildungskontext

Dieses Projekt wurde entwickelt als Unterstützungssystem für deutsche Berufsschulen zur digitalen Verwaltung von Ausbildungsnachweisen (Nachweise für Azubis).

**Hintergrund:**

- Ersetzt traditionelle papiergestützte Prozesse
- Ermöglicht digitale Archivierung und Suche
- Verbessert Kommunikation zwischen Azubis und Ausbildern
- Unterstützt Transparenz im Ausbildungsprozess

---

**Viel Erfolg bei der Nutzung! 🚀**
