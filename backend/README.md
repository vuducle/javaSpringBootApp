# Nachweise Backend - Spring Boot API

Modernes Spring Boot 3 Backend zur Verwaltung von Ausbildungsnachweisen mit JWT-Authentifizierung, PostgreSQL-Datenbank, E-Mail-Service und PDF-Generierung.

## 🎯 Features

### Authentifizierung & Benutzerverwaltung

- ✅ JWT-basierte Authentifizierung (Access & Refresh Tokens)
- 🔐 Passwort-Hashing mit BCrypt
- 👥 Rollen-System (ADMIN, AUSBILDER, AZUBI)
- 📧 E-Mail-Verifizierung und Passwort-Reset
- 👤 Profilverwaltung mit Profilbild-Upload (WebP-Optimierung)

### Nachweise-Management

- 📝 CRUD-Operationen für Ausbildungsnachweise
- 📄 Automatische PDF-Generierung
- ✅ Status-Workflow (EINGEREICHT, ANGENOMMEN, ABGELEHNT)
- 💬 Kommentar-System für Feedback
- 📧 Automatische E-Mail-Benachrichtigungen mit PDF-Anhängen

### Batch-Operationen

- 📦 **Batch-Export**: Mehrere Nachweise als ZIP-Archiv
- 🗑️ **Batch-Delete**: Mehrere Nachweise gleichzeitig löschen
- ⚡ **Batch-Status-Update**: Mehrere Nachweise gleichzeitig genehmigen/ablehnen
- 📧 **Automatische E-Mails**: Bei Status-Updates werden PDFs an Azubis gesendet

### Admin-Features

- 🔑 Benutzerverwaltung (Erstellen, Bearbeiten, Löschen)
- 📝 Audit-Logging für alle wichtigen Aktionen
- 📊 Dashboard-Statistiken
- 🔍 Erweiterte Such- und Filterfunktionen

## 🚀 Quick Start

### Voraussetzungen

- Java 17 oder höher
- Gradle (Wrapper inkludiert)
- PostgreSQL 15+
- (Optional) Redis für Session-Management
- (Optional) SMTP-Server für E-Mails

### 1. Anwendung starten

```bash
# Build (ohne Tests)
./gradlew build -x test

# Starten
./gradlew bootRun
```

Standard-Port: `8088`

Falls `./gradlew` nicht ausführbar ist:

```bash
chmod +x gradlew
```

### 2. Swagger UI öffnen

- **Swagger UI**: http://localhost:8088/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8088/v3/api-docs

Die Swagger UI unterstützt Bearer-Token Authentifizierung über den "Authorize"-Button.

## 📖 API-Dokumentation

### Authentication Endpoints

#### `POST /api/auth/register`

Neuen Benutzer registrieren

**Request Body:**

```json
{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "password": "sicheres-passwort",
  "role": "AZUBI"
}
```

#### `POST /api/auth/login`

Benutzer anmelden

**Request Body:**

```json
{
  "email": "max@example.com",
  "password": "sicheres-passwort"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Max Mustermann",
    "email": "max@example.com",
    "role": "AZUBI"
  }
}
```

#### `POST /api/auth/refresh`

Access Token erneuern

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /api/auth/forgot-password`

Passwort zurücksetzen anfordern

**Request Body:**

```json
{
  "email": "max@example.com"
}
```

#### `POST /api/auth/reset-password`

Neues Passwort setzen

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "neues-sicheres-passwort"
}
```

### Nachweise Endpoints

#### `GET /api/nachweise`

Eigene Nachweise abrufen (mit Paginierung)

**Query Parameters:**

- `page` (optional): Seite (Standard: 0)
- `size` (optional): Anzahl pro Seite (Standard: 10)
- `status` (optional): Filter nach Status
- `sort` (optional): Sortierung (z.B. `createdAt,desc`)

**Response:**

```json
{
  "content": [
    {
      "id": "uuid",
      "nummer": 1,
      "titel": "Wartungsarbeiten",
      "beschreibung": "Router konfiguriert",
      "datum": "2025-12-20",
      "status": "ANGENOMMEN",
      "kommentar": "Gut gemacht!",
      "createdAt": "2025-12-20T10:00:00Z"
    }
  ],
  "totalElements": 10,
  "totalPages": 1,
  "number": 0,
  "size": 10
}
```

#### `POST /api/nachweise`

Neuen Nachweis erstellen

**Request Body:**

```json
{
  "titel": "Netzwerkinstallation",
  "beschreibung": "Switch konfiguriert und verkabelt",
  "datum": "2025-12-20",
  "dauer": 480
}
```

#### `PUT /api/nachweise/{id}`

Nachweis aktualisieren

#### `DELETE /api/nachweise/{id}`

Nachweis löschen

#### `GET /api/nachweise/{id}/pdf`

PDF des Nachweises herunterladen

**Response:** PDF-Datei als Stream

#### `POST /api/nachweise/batch-export`

Mehrere Nachweise als ZIP exportieren

**Request Body:**

```json
{
  "nachweisIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** ZIP-Datei mit allen PDFs

#### `POST /api/nachweise/batch-delete`

Mehrere Nachweise löschen

**Request Body:**

```json
{
  "nachweisIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**

```json
{
  "deletedCount": 3,
  "failedCount": 0,
  "failedIds": []
}
```

#### `PUT /api/nachweise/batch-status` (Admin/Ausbilder)

Mehrere Nachweise genehmigen oder ablehnen

**Request Body:**

```json
{
  "nachweisIds": ["uuid1", "uuid2", "uuid3"],
  "status": "ANGENOMMEN",
  "comment": "Alle gut dokumentiert"
}
```

**Response:**

```json
{
  "updatedCount": 3,
  "failedCount": 0,
  "failedIds": [],
  "message": "3 Nachweise wurden erfolgreich aktualisiert"
}
```

**Hinweis:** Bei jedem Status-Update wird automatisch eine E-Mail mit dem PDF-Anhang an den Azubi gesendet.

### User Profile Endpoints

#### `GET /api/user/profile`

Eigenes Profil abrufen

#### `PUT /api/user/change-password`

Passwort ändern

**Request Body:**

```json
{
  "oldPassword": "altes-passwort",
  "newPassword": "neues-passwort"
}
```

#### `PUT /api/user/profile-image` (multipart/form-data)

Profilbild hochladen

**Form Data:**

- `file`: Image-Datei (automatische WebP-Konvertierung und Skalierung auf 1024x1024)

#### `DELETE /api/user/profile-image`

Profilbild löschen

### Admin Endpoints

#### `GET /api/user` (Admin)

Alle Benutzer abrufen

#### `POST /api/user` (Admin)

Neuen Benutzer erstellen

#### `PUT /api/user/{id}` (Admin)

Benutzer bearbeiten

#### `DELETE /api/user/{id}` (Admin)

Benutzer löschen

#### `GET /api/audit-logs` (Admin)

Audit-Logs abrufen

## 🔐 Authentifizierung

Alle geschützten Endpoints benötigen einen Bearer-Token im Authorization-Header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token-Lebensdauer

- **Access Token**: 15 Minuten
- **Refresh Token**: 7 Tage

## 📁 Datei-Upload & Storage

### Profilbilder

- **Speicherort**: `uploads/profile-images/`
- **Format**: WebP (Fallback: JPEG)
- **Max. Größe**: 1024x1024px (automatische Skalierung)
- **Qualität**: ~75%
- **URL**: `/uploads/profile-images/{userId}_{timestamp}.webp`

### PDF-Nachweise

- **Speicherort**: `generated_pdfs/{username}_{userId}/`
- **Format**: PDF (Apache PDFBox)
- **Namensschema**: `{nachweisId}.pdf`

Erstelle die Upload-Verzeichnisse falls nicht vorhanden:

```bash
mkdir -p uploads/profile-images
mkdir -p generated_pdfs
```

**Hinweis**: Füge `uploads/` und `generated_pdfs/` zu `.gitignore` hinzu.

## 📧 E-Mail-Service

### Konfiguration

In `application.properties` oder Environment-Variablen:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### E-Mail-Templates

1. **Willkommens-E-Mail**: Nach Registrierung
2. **E-Mail-Verifizierung**: Mit Bestätigungslink
3. **Passwort-Reset**: Mit Reset-Token
4. **Status-Update**: Nachweis angenommen/abgelehnt (mit PDF-Anhang)
5. **Neuer Nachweis**: Benachrichtigung an Ausbilder (mit PDF-Anhang)

Alle E-Mails sind HTML-formatiert und enthalten das Corporate Design.

## 🗄️ Datenbank

### Schema

Haupttabellen:

- `users` - Benutzer (Azubis, Ausbilder, Admins)
- `nachweise` - Ausbildungsnachweise
- `audit_logs` - System-Audit-Trail
- `notifications` - In-App-Benachrichtigungen

### Flyway Migrations

Automatische Datenbank-Migrationen in `src/main/resources/db/migration/`:

```
V1__Initial_schema.sql
V2__Add_profile_images.sql
V3__Add_batch_operations.sql
```

Siehe [FLYWAY_GUIDE.md](docs/FLYWAY_GUIDE.md) für Details.

## 🧪 Testing

### Unit Tests

```bash
./gradlew test
```

### Integration Tests

```bash
./gradlew integrationTest
```

### Coverage Report

```bash
./gradlew jacocoTestReport
# Report: build/reports/jacoco/test/html/index.html
```

## 🛠️ Konfiguration

### Application Profiles

- `application.properties` - Basis-Konfiguration
- `application-dev.properties` - Entwicklung
- `application-prod.properties` - Produktion
- `application-test.properties` - Tests

### Wichtige Properties

```properties
# Server
server.port=8088

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/nachweise_db
spring.datasource.username=nachweise_user
spring.datasource.password=strong-password

# JWT
jwt.secret=your-256-bit-secret-key-min-32-chars
jwt.expiration=900000  # 15 min
jwt.refresh-expiration=604800000  # 7 days

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Mail
spring.mail.host=smtp.gmail.com
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### Environment Variables (Docker)

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/nachweise_db
SPRING_DATASOURCE_USERNAME=nachweise_user
SPRING_DATASOURCE_PASSWORD=${POSTGRES_PASSWORD}
JWT_SECRET=${JWT_SECRET}
SPRING_MAIL_USERNAME=${MAIL_USERNAME}
SPRING_MAIL_PASSWORD=${MAIL_PASSWORD}
```

## 🔧 Troubleshooting

### Zirkuläre Bean-Referenzen

Falls beim Start zirkuläre Abhängigkeiten auftreten:

- `PasswordEncoderConfig` wurde bereits ausgelagert
- Verwende `@Lazy` für Bean-Injections

### Datenbank-Verbindungsfehler

```bash
# PostgreSQL läuft?
docker ps | grep postgres

# Connection testen
psql -h localhost -U nachweise_user -d nachweise_db

# Logs prüfen
docker-compose logs backend
```

### PDF-Generierung schlägt fehl

```bash
# Verzeichnis existiert?
mkdir -p generated_pdfs

# Schreibrechte?
chmod 755 generated_pdfs

# Logs prüfen
tail -f logs/spring.log
```

### E-Mail-Versand funktioniert nicht

1. SMTP-Credentials korrekt?
2. Gmail: App-Passwort erstellt? (nicht das normale Passwort)
3. Firewall blockiert Port 587?

## 📊 Logging

### Konfiguration

`logback-spring.xml` definiert:

- Console Logging (Development)
- File Logging (Production)
- Separate Error-Logs
- Log-Rotation

### Log-Levels anpassen

```properties
# In application.properties
logging.level.org.example.springboot=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.hibernate.SQL=DEBUG
```

### Log-Dateien

- `logs/spring.log` - Alle Logs
- `logs/error.log` - Nur Errors
- Automatische Rotation bei 10MB

## 🚀 Deployment

### Docker Build

```bash
# Image bauen
docker build -t nachweise-backend .

# Container starten
docker run -p 8088:8088 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/nachweise_db \
  -e JWT_SECRET=your-secret \
  nachweise-backend
```

### Mit Docker Compose

```bash
docker-compose up -d backend
```

Siehe [../DEPLOYMENT.md](../DEPLOYMENT.md) für vollständige Deployment-Anleitung.

## 📚 Weitere Dokumentation

- [USER_API_DOCUMENTATION.md](docs/USER_API_DOCUMENTATION.md) - Detaillierte API-Docs
- [FLYWAY_GUIDE.md](docs/FLYWAY_GUIDE.md) - Datenbank-Migrationen
- [../DEPLOYMENT.md](../DEPLOYMENT.md) - Production Deployment
- [../CICD_SETUP.md](../CICD_SETUP.md) - CI/CD Pipeline

## 🧩 Technologie-Stack

- **Framework**: Spring Boot 3.2
- **Language**: Java 17
- **Build Tool**: Gradle 8
- **Database**: PostgreSQL 15 + Flyway
- **Security**: Spring Security + JWT
- **Email**: Spring Mail + JavaMail
- **PDF**: Apache PDFBox
- **Image Processing**: Java ImageIO
- **Logging**: Logback + SLF4J
- **Documentation**: SpringDoc OpenAPI 3
- **Testing**: JUnit 5 + Mockito

## 📝 cURL Beispiele

### Login

```bash
curl -X POST http://localhost:8088/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "max@example.com",
    "password": "passwort123"
  }'
```

### Nachweise abrufen

```bash
curl -X GET http://localhost:8088/api/nachweise \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Nachweis erstellen

```bash
curl -X POST http://localhost:8088/api/nachweise \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titel": "Server-Wartung",
    "beschreibung": "Windows Server 2019 Updates installiert",
    "datum": "2025-12-20",
    "dauer": 480
  }'
```

### Batch-Export

```bash
curl -X POST http://localhost:8088/api/nachweise/batch-export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nachweisIds": ["uuid1", "uuid2", "uuid3"]
  }' \
  --output nachweise.zip
```

### Batch-Status-Update (Admin)

```bash
curl -X PUT http://localhost:8088/api/nachweise/batch-status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nachweisIds": ["uuid1", "uuid2"],
    "status": "ANGENOMMEN",
    "comment": "Alle gut dokumentiert"
  }'
```

### Profilbild hochladen

```bash
curl -X PUT http://localhost:8088/api/user/profile-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

---

**Viel Erfolg beim Entwickeln! 🚀**
