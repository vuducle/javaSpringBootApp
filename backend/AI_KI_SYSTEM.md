# KI-basiertes Ausbildungsnachweis System

## Überblick

Dieses System nutzt **Ollama mit Gemma3:1b** als KI-Backend für die intelligente Bewertung von Ausbildungsnachweisen. Ein Ausbilder ("Triesnha Ameilya - IT-Ausbilderin und Teamleiterin") prüft die wöchentlichen Aktivitäten der Azubis auf:

- Fachliche Qualität
- Plausibilität der Stundenangaben
- Rechtschreibung und Grammatik
- Erfasste Kompetenzen (Skills)

## KI-Service Architektur

### NachweisAiService

- **Location**: `src/main/java/org/example/springboot/service/ai/NachweisAiService.java`
- **Responsibilities**:
  - Kommunikation mit Ollama/Gemma3:1b
  - Aufbereitung von Aktivitäten-Daten
  - Parsing der KI-Responses (JSON)
  - Logging und Error-Handling

### Key Features

✅ Strikte JSON-Response Format-Erzwingung  
✅ Logging für Debugging  
✅ Exception-Handling mit aussagekräftigen Fehlermeldungen  
✅ Support für Activity-Entities und DTOs

## REST API Endpoints

### Base URL

```
http://localhost:8080/api/nachweis/ai
```

---

### 1. **Health Check / System Status**

```
GET /api/nachweis/ai/health
```

**Response (200 OK):**

```json
{
  "status": "OK",
  "message": "KI-System läuft mit Ollama Gemma3:1b",
  "timestamp": 1703520000000,
  "ai_model": "gemma3:1b",
  "ai_provider": "Ollama"
}
```

---

### 2. **Test-Endpoint (mit Beispieldaten)**

```
GET /api/nachweis/ai/test
```

**Description**: Testet die KI mit vordefinierten Beispiel-Aktivitäten

**Response (200 OK):**

```json
{
  "status": "SUCCESS",
  "message": "KI-Test erfolgreich durchgeführt",
  "test_data_count": 5,
  "ai_result": {
    "akzeptiert": true,
    "status": "GENEHMIGT",
    "feedback": "Sehr guter Wochenbericht! Vielfältige Tätigkeiten mit realistischen Stundenangaben. Gutes Verständnis für Backend-Entwicklung erkennbar.",
    "gefundeneSkills": [
      "REST-API Entwicklung",
      "Testing",
      "Datenbank-Migration",
      "Code Review"
    ],
    "warnungen": []
  },
  "timestamp": 1703520000000
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "status": "ERROR",
  "message": "KI-Test fehlgeschlagen: Connection refused to Ollama",
  "timestamp": 1703520000000
}
```

---

### 3. **Nachweis Review (Main Endpoint)**

```
POST /api/nachweis/ai/review
Content-Type: application/json
```

**Request Body:**

```json
{
  "nachweisId": "550e8400-e29b-41d4-a716-446655440000",
  "activities": [
    {
      "day": "Montag",
      "hours": 8.0,
      "description": "Entwicklung einer REST-API mit Spring Boot und PostgreSQL",
      "section": "Backend"
    },
    {
      "day": "Dienstag",
      "hours": 8.0,
      "description": "Unit-Tests schreiben und API-Debugging",
      "section": "Backend"
    },
    {
      "day": "Mittwoch",
      "hours": 6.0,
      "description": "Code-Review und Dokumentation",
      "section": "Backend"
    },
    {
      "day": "Donnerstag",
      "hours": 8.0,
      "description": "Datenbankoptimierung und Performance-Testing",
      "section": "Backend"
    },
    {
      "day": "Freitag",
      "hours": 4.0,
      "description": "Wochenplanung und Meetings",
      "section": "Allgemein"
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "status": "SUCCESS",
  "message": "Nachweis-Review erfolgreich",
  "nachweisId": "550e8400-e29b-41d4-a716-446655440000",
  "aktivitätenAnzahl": 5,
  "ai_review": {
    "akzeptiert": true,
    "status": "GENEHMIGT",
    "feedback": "Sehr guter Nachweis! Realistische Stundenverteilung, fachlich korrekt, gutes Verständnis für Backend-Technologien. Weiterhin so!",
    "gefundeneSkills": [
      "REST-API Entwicklung",
      "Spring Boot",
      "PostgreSQL",
      "Unit Testing",
      "Code Review",
      "Performance-Optimierung"
    ],
    "warnungen": []
  },
  "timestamp": 1703520000000
}
```

**Error Response (400 Bad Request):**

```json
{
  "status": "ERROR",
  "message": "Keine Aktivitäten im Request vorhanden",
  "timestamp": 1703520000000
}
```

---

### 4. **Sample Activity abrufen**

```
GET /api/nachweis/ai/sample
```

**Response (200 OK):**

```json
{
  "status": "SUCCESS",
  "message": "Beispiel-Aktivität",
  "sample_activity": {
    "day": "Montag",
    "hours": 8,
    "description": "Implementierung einer REST-API mit Spring Boot, Authentication und Fehlerbehandlung",
    "section": "Backend"
  },
  "info": "Dies ist ein Beispiel für eine einzelne Aktivität. Mehrere Aktivitäten bilden einen Wochenbericht."
}
```

---

### 5. **KI-Informationen abrufen**

```
GET /api/nachweis/ai/info
```

**Response (200 OK):**

```json
{
  "ai_name": "Triesnha Ameilya",
  "ai_role": "IT-Ausbilderin und Teamleiterin",
  "ai_model": "gemma3:1b",
  "ai_provider": "Ollama",
  "purpose": "Bewertung von Ausbildungsnachweisen und Feedback für Azubis",
  "base_url": "http://localhost:11434/"
}
```

---

## Konfiguration

### application.properties

```properties
# Ollama KI-Konfiguration
spring.ai.ollama.base-url=http://localhost:11434/
spring.ai.ollama.chat.options.model=gemma3:1b
spring.ai.ollama.chat.options.temperature=0.2

# Optional: AI-Name und Rolle konfigurierbar
ai.ausbildername=Triesnha Ameilya
ai.rolle=IT-Ausbilderin und Teamleiterin
```

---

## Verwendungsbeispiele

### Beispiel 1: Test durchführen

```bash
curl -X GET http://localhost:8080/api/nachweis/ai/test
```

### Beispiel 2: Nachweis bewerten

```bash
curl -X POST http://localhost:8080/api/nachweis/ai/review \
  -H "Content-Type: application/json" \
  -d '{
    "nachweisId": "550e8400-e29b-41d4-a716-446655440000",
    "activities": [
      {
        "day": "Montag",
        "hours": 8,
        "description": "REST-API Entwicklung",
        "section": "Backend"
      },
      {
        "day": "Dienstag",
        "hours": 8,
        "description": "Testing",
        "section": "Backend"
      }
    ]
  }'
```

### Beispiel 3: KI-Info abrufen

```bash
curl -X GET http://localhost:8080/api/nachweis/ai/info
```

---

## ReviewResult Struktur

Die KI gibt **immer** folgende JSON-Struktur zurück:

```java
public record ReviewResult(
    boolean akzeptiert,           // true = genehmigt, false = abgelehnt
    String status,                // "GENEHMIGT", "ABGELEHNT", "ÜBERPRÜFUNG_NÖTIG"
    String feedback,              // Detailliertes Feedback vom Ausbilder
    List<String> gefundeneSkills, // Erkannte Fachkompetenzen
    List<String> warnungen        // Warnungen/Fehlerpunkte
)
```

---

## Kriterien für die KI-Bewertung

Die KI bewertet die Nachweise nach folgenden Kriterien:

1. **Stundenverteilung**: Sind die Stunden realistisch für die Tätigkeit?
2. **Fachliche Qualität**: Ist die Beschreibung aussagekräftig und technisch korrekt?
3. **Vollständigkeit**: Fehlen wichtige Informationen?
4. **Kompetenzentwicklung**: Welche Skills wurden demonstriert?
5. **Sprachliche Qualität**: Deutsche Rechtschreibung und Grammatik
6. **Plausibilität**: Sind alle Angaben in sich konsistent?

---

## Fehlerbehandlung

### Häufige Fehler

| Fehler                               | Ursache                            | Lösung                            |
| ------------------------------------ | ---------------------------------- | --------------------------------- |
| 500 - "Connection refused to Ollama" | Ollama läuft nicht                 | `ollama serve` starten            |
| 500 - "Model not found: gemma3:1b"   | Modell nicht installiert           | `ollama pull gemma3:1b` ausführen |
| 400 - "Keine Aktivitäten im Request" | Leeres activities Array            | Mindestens 1 Aktivität hinzufügen |
| 500 - "JSON parsing error"           | KI-Response ist kein gültiges JSON | Model-Prompt überprüfen           |

---

## Entwickler-Notizen

### Service Verbesserungen

- ✅ Logging mit SLF4J hinzugefügt
- ✅ Fehlerbehandlung mit aussagekräftigen Fehlern
- ✅ Support für Activity-Entities und DTOs
- ✅ Detaillierter Prompt für bessere JSON-Responses

### Nächste Schritte

- [ ] Integration mit Nachweis-Entity (speichern von KI-Bewertungen)
- [ ] Caching von KI-Responses (Redis)
- [ ] Audit-Logging für alle Reviews
- [ ] E-Mail-Benachrichtigungen an Azubis
- [ ] Grafische Dashboard für Bewertungshistorie
- [ ] Multi-Language Support (Englisch, Spanisch)

---

## Kontakt & Support

Für Fragen oder Probleme mit der KI-Integration:

- Check Application Logs: `backend/logs/application.log`
- Verifyieren Sie die Ollama-Verbindung: `curl http://localhost:11434/api/tags`
- Test-Endpoint verwenden um System zu testen
