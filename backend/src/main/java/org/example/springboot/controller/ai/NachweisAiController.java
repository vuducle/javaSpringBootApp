package org.example.springboot.controller.ai;

import org.example.springboot.service.ai.NachweisAiService;
import org.example.springboot.controller.ai.dto.NachweisAiReviewRequest;
import org.example.springboot.controller.ai.dto.ActivityDTO;
import org.example.springboot.model.record.ReviewResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST-Controller für KI-basierte Nachweis-Bewertung
 * Endpoint-Prefix: /api/nachweis/ai
 * 
 * Diese API unterstützt Azubis und Ausbilder bei der Bewertung von
 * Ausbildungsnachweisen
 * mithilfe von Ollama (Gemma3:1b) Modell als KI-Unterstützung.
 */
@RestController
@RequestMapping("/api/nachweis/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "KI-Nachweis-Bewertung", description = "Endpoints für KI-basierte Bewertung von Ausbildungsnachweisen mit Ollama Gemma3:1b")
public class NachweisAiController {

    private static final Logger logger = LoggerFactory.getLogger(NachweisAiController.class);
    private final NachweisAiService nachweisAiService;

    public NachweisAiController(NachweisAiService nachweisAiService) {
        this.nachweisAiService = nachweisAiService;
    }

    /**
     * Health-Check / Test-Endpoint für KI-System
     * GET /api/nachweis/ai/health
     * 
     * @return Health-Status
     */
    @GetMapping("/health")
    @Operation(summary = "KI-System Health Check", description = "Überprüft, ob das Ollama KI-System und die API erreichbar sind")
    @ApiResponse(responseCode = "200", description = "KI-System läuft", content = @Content(schema = @Schema(implementation = Map.class)))
    public ResponseEntity<Map<String, Object>> healthCheck() {
        logger.info("KI-Health-Check aufgerufen");

        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "KI-System läuft mit Ollama Gemma3:1b");
        response.put("timestamp", System.currentTimeMillis());
        response.put("ai_model", "gemma3:1b");
        response.put("ai_provider", "Ollama");

        return ResponseEntity.ok(response);
    }

    /**
     * Test-Endpoint mit Beispiel-Aktivitäten
     * GET /api/nachweis/ai/test
     * 
     * @return Test-Bewertung mit Beispieldaten
     */
    @GetMapping("/test")
    @Operation(summary = "KI-System Test durchführen", description = "Testet das KI-System mit vordefinierten Beispiel-Aktivitäten einer Woche")
    @ApiResponse(responseCode = "200", description = "Test erfolgreich abgeschlossen", content = @Content(schema = @Schema(implementation = Map.class)))
    @ApiResponse(responseCode = "500", description = "Fehler beim Test", content = @Content(schema = @Schema(implementation = Map.class)))
    public ResponseEntity<Map<String, Object>> testAiSystem() {
        logger.info("KI-Test-Endpoint aufgerufen");

        try {
            // Beispiel-Aktivitäten für einen Test
            List<ActivityDTO> testActivities = List.of(
                    new ActivityDTO("Montag", java.math.BigDecimal.valueOf(8),
                            "Entwicklung eines REST-APIs für Benutzerregistrierung mit Spring Boot",
                            "Backend"),
                    new ActivityDTO("Dienstag", java.math.BigDecimal.valueOf(8),
                            "Testing und Debugging des APIs, Unit-Tests mit JUnit5 geschrieben",
                            "Backend"),
                    new ActivityDTO("Mittwoch", java.math.BigDecimal.valueOf(6),
                            "Code-Review und Dokumentation der API-Endpoints",
                            "Backend"),
                    new ActivityDTO("Donnerstag", java.math.BigDecimal.valueOf(8),
                            "Migration auf PostgreSQL und Hibernate-Mapping",
                            "Backend"),
                    new ActivityDTO("Freitag", java.math.BigDecimal.valueOf(4),
                            "Vorbereitung für nächste Woche, Gespräch mit Ausbilder Sebastian Preuschoff",
                            "Allgemein"));

            // KI-Analyse durchführen
            ReviewResult result = nachweisAiService.analysiereWocheFromDTO(testActivities);

            // Response aufbauen
            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "KI-Test erfolgreich durchgeführt");
            response.put("test_data_count", testActivities.size());
            response.put("ai_result", Map.of(
                    "akzeptiert", result.akzeptiert(),
                    "status", result.status(),
                    "feedback", result.feedback(),
                    "gefundeneSkills", result.gefundeneSkills(),
                    "warnungen", result.warnungen()));
            response.put("timestamp", System.currentTimeMillis());

            logger.info("KI-Test erfolgreich - Nachweis akzeptiert: {}", result.akzeptiert());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Fehler beim KI-Test", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "KI-Test fehlgeschlagen: " + e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Review eines kompletten Nachweises
     * POST /api/nachweis/ai/review
     * 
     * @param request NachweisAiReviewRequest mit Aktivitäten
     * @return KI-Bewertung des Nachweises
     */
    @PostMapping("/review")
    @Operation(summary = "Nachweis-Review durch KI durchführen", description = "Analysiert einen Ausbildungsnachweis mit mehreren Aktivitäten und gibt eine KI-basierte Bewertung mit Feedback")
    @ApiResponse(responseCode = "200", description = "Review erfolgreich abgeschlossen", content = @Content(schema = @Schema(implementation = Map.class)))
    @ApiResponse(responseCode = "400", description = "Ungültige Request - keine Aktivitäten vorhanden", content = @Content(schema = @Schema(implementation = Map.class)))
    @ApiResponse(responseCode = "500", description = "Fehler bei der KI-Analyse", content = @Content(schema = @Schema(implementation = Map.class)))
    public ResponseEntity<Map<String, Object>> reviewNachweis(@RequestBody NachweisAiReviewRequest request) {
        logger.info("Nachweis-Review angefordert für NachweisId: {}", request.nachweisId());

        if (request.activities() == null || request.activities().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Keine Aktivitäten im Request vorhanden");
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            ReviewResult result = nachweisAiService.analysiereWocheFromDTO(request.activities());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Nachweis-Review erfolgreich");
            response.put("nachweisId", request.nachweisId());
            response.put("aktivitätenAnzahl", request.activities().size());
            response.put("ai_review", Map.of(
                    "akzeptiert", result.akzeptiert(),
                    "status", result.status(),
                    "feedback", result.feedback(),
                    "gefundeneSkills", result.gefundeneSkills(),
                    "warnungen", result.warnungen()));
            response.put("timestamp", System.currentTimeMillis());

            logger.info("Nachweis-Review abgeschlossen - akzeptiert: {}", result.akzeptiert());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Fehler beim Nachweis-Review", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Review fehlgeschlagen: " + e.getMessage());
            errorResponse.put("nachweisId", request.nachweisId());
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * GET eine Beispiel-Aktivität für Tests/Dokumentation
     * GET /api/nachweis/ai/sample
     * 
     * @return Beispiel einer Nachweis-Aktivität
     */
    @GetMapping("/sample")
    @Operation(summary = "Beispiel-Aktivität abrufen", description = "Gibt ein Beispiel für eine Aktivität zurück, die für einen Nachweis eingetragen werden kann")
    @ApiResponse(responseCode = "200", description = "Beispiel erfolgreich abgerufen", content = @Content(schema = @Schema(implementation = Map.class)))
    public ResponseEntity<Map<String, Object>> getSampleActivity() {
        logger.info("Sample Activity angefordert");

        Map<String, Object> sampleActivity = new HashMap<>();
        sampleActivity.put("day", "Montag");
        sampleActivity.put("hours", 8);
        sampleActivity.put("description",
                "Implementierung einer REST-API mit Spring Boot, Authentication und Fehlerbehandlung");
        sampleActivity.put("section", "Backend");

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Beispiel-Aktivität");
        response.put("sample_activity", sampleActivity);
        response.put("info",
                "Dies ist ein Beispiel für eine einzelne Aktivität. Mehrere Aktivitäten bilden einen Wochenbericht.");

        return ResponseEntity.ok(response);
    }

    /**
     * Gibt Informationen über die KI und deren Rollen zurück
     * GET /api/nachweis/ai/info
     * 
     * @return Informationen über die KI-Konfiguration
     */
    @GetMapping("/info")
    @Operation(summary = "KI-Informationen abrufen", description = "Gibt Metainformationen über das KI-System, den Modelltyp und Konfiguration zurück")
    @ApiResponse(responseCode = "200", description = "KI-Informationen erfolgreich abgerufen", content = @Content(schema = @Schema(implementation = Map.class)))
    public ResponseEntity<Map<String, String>> getAiInfo() {
        logger.info("KI-Informationen angefordert");

        Map<String, String> info = new HashMap<>();
        info.put("ai_name", "Triesnha Ameilya");
        info.put("ai_role", "IT-Ausbilderin und Teamleiterin");
        info.put("ai_model", "gemma3:1b");
        info.put("ai_provider", "Ollama");
        info.put("purpose", "Bewertung von Ausbildungsnachweisen und Feedback für Azubis");
        info.put("base_url", "http://localhost:11434/");

        return ResponseEntity.ok(info);
    }
}
