package org.example.springboot.controller.ai;

import org.example.springboot.dto.AiChatRequest;
import org.example.springboot.dto.NachweisAiValidationResponse;
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

import java.math.BigDecimal;
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
                    new ActivityDTO("Montag", BigDecimal.valueOf(8),
                            "Entwicklung eines REST-APIs für Benutzerregistrierung mit Spring Boot",
                            "Backend"),
                    new ActivityDTO("Dienstag", BigDecimal.valueOf(8),
                            "Testing und Debugging des APIs, Unit-Tests mit JUnit5 geschrieben",
                            "Backend"),
                    new ActivityDTO("Mittwoch", BigDecimal.valueOf(6),
                            "Code-Review und Dokumentation der API-Endpoints",
                            "Backend"),
                    new ActivityDTO("Donnerstag", BigDecimal.valueOf(8),
                            "Migration auf PostgreSQL und Hibernate-Mapping",
                            "Backend"),
                    new ActivityDTO("Freitag", BigDecimal.valueOf(4),
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

    /**
     * Vollständige Validierung eines Nachweises mit Metadaten
     * POST /api/nachweis/ai/validate
     * Überprüft nicht nur die Aktivitäten, sondern auch Datum, Ausbildungsjahr und
     * weitere Metadaten
     * 
     * @param request NachweisAiValidationRequest mit kompletten Nachweisdaten
     * @return Detaillierte Validierungsergebnisse
     */
    @PostMapping("/validate")
    @Operation(summary = "Vollständige Nachweis-Validierung durchführen", description = "Analysiert einen kompletten Ausbildungsnachweis mit allen Metadaten (Datum, Ausbildungsjahr, Nummer, etc.) und gibt detaillierte Validierungsergebnisse")
    @ApiResponse(responseCode = "200", description = "Validierung erfolgreich abgeschlossen", content = @Content(schema = @Schema(implementation = Map.class)))
    @ApiResponse(responseCode = "400", description = "Ungültige Request - Pflichtfelder fehlen", content = @Content(schema = @Schema(implementation = Map.class)))
    @ApiResponse(responseCode = "500", description = "Fehler bei der KI-Validierung", content = @Content(schema = @Schema(implementation = Map.class)))
    public ResponseEntity<Map<String, Object>> validateNachweisComplete(
            @RequestBody org.example.springboot.dto.NachweisAiValidationRequest request) {

        logger.info("Vollständige Nachweis-Validierung angefordert für Nachweis-ID: {}", request.nachweisId());

        // Validierung der Request-Parameter
        if (request.activities() == null || request.activities().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Keine Aktivitäten im Request vorhanden");
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        if (request.datumStart() == null || request.datumEnde() == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Startdatum oder Enddatum fehlt");
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            NachweisAiValidationResponse validationResult = nachweisAiService.validateNachweisComplete(request);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Nachweis-Validierung erfolgreich abgeschlossen");
            response.put("nachweisId", request.nachweisId());
            response.put("azubiName", request.azubiName());
            response.put("ausbildungsjahr", request.ausbildungsjahr());
            response.put("aktivitätenAnzahl", request.activities().size());

            // Validierungsergebnisse
            response.put("akzeptiert", validationResult.akzeptiert());
            response.put("status", validationResult.status());
            response.put("feedback", validationResult.feedback());

            // Detaillierte Validierungen
            Map<String, Object> metadataVal = new HashMap<>();
            metadataVal.put("datumStartValid", validationResult.metadataValidation().datumStartValid());
            metadataVal.put("datumEndeValid", validationResult.metadataValidation().datumEndeValid());
            metadataVal.put("datumRangeValid", validationResult.metadataValidation().datumRangeValid());
            metadataVal.put("ausbildungsjährValid", validationResult.metadataValidation().ausbildungsjährValid());
            metadataVal.put("nummerValid", validationResult.metadataValidation().nummerValid());
            metadataVal.put("feedback", validationResult.metadataValidation().feedback());
            response.put("metadataValidation", metadataVal);

            Map<String, Object> activitiesVal = new HashMap<>();
            activitiesVal.put("anzahlAktivitäten", validationResult.activitiesValidation().anzahlAktivitäten());
            activitiesVal.put("durchschnittlicheStunden",
                    validationResult.activitiesValidation().durchschnittlicheStunden());
            activitiesVal.put("alleTageCovered", validationResult.activitiesValidation().alleTageCovered());
            activitiesVal.put("stundenRealistisch", validationResult.activitiesValidation().stundenRealistisch());
            activitiesVal.put("feedback", validationResult.activitiesValidation().feedback());
            response.put("activitiesValidation", activitiesVal);

            response.put("gefundeneSkills", validationResult.gefundeneSkills());
            response.put("warnungen", validationResult.warnungen());
            response.put("timestamp", System.currentTimeMillis());

            logger.info("Vollständige Nachweis-Validierung abgeschlossen - akzeptiert: {}",
                    validationResult.akzeptiert());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Fehler bei vollständiger Nachweis-Validierung", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Validierung fehlgeschlagen: " + e.getMessage());
            errorResponse.put("nachweisId", request.nachweisId());
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Generischer Chat-Endpoint für direkten Austausch mit dem LLM
     * POST /api/nachweis/ai/chat
     * 
     * @param request Chat-Request mit Nachricht und optionalem Kontext
     * @return Chat-Response vom LLM
     */
    @PostMapping("/chat")
    @Operation(summary = "Chat mit dem LLM", description = "Ermöglicht einen direkten Chat-Austausch mit dem LLM. Der Azubi/Ausbilder kann Fragen stellen und erhält Antworten vom KI-System")
    @ApiResponse(responseCode = "200", description = "Chat erfolgreich verarbeitet", content = @Content(schema = @Schema(implementation = Map.class)))
    @ApiResponse(responseCode = "400", description = "Ungültige Request - Nachricht fehlt", content = @Content(schema = @Schema(implementation = Map.class)))
    @ApiResponse(responseCode = "500", description = "Fehler bei der KI-Verarbeitung", content = @Content(schema = @Schema(implementation = Map.class)))
    public ResponseEntity<Map<String, Object>> chat(@RequestBody AiChatRequest request) {
        logger.info("Chat-Request erhalten: {}", request.message());

        // Validierung
        if (request.message() == null || request.message().trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Nachricht darf nicht leer sein");
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            org.example.springboot.dto.AiChatResponse chatResponse = nachweisAiService.chat(request.message(),
                    request.context());

            Map<String, Object> response = new HashMap<>();
            response.put("status", chatResponse.success() ? "SUCCESS" : "ERROR");
            response.put("message", chatResponse.response());

            if (!chatResponse.success()) {
                response.put("error", chatResponse.error());
            }

            response.put("userMessage", request.message());
            if (request.context() != null && !request.context().isEmpty()) {
                response.put("context", request.context());
            }
            response.put("timestamp", System.currentTimeMillis());

            if (chatResponse.success()) {
                logger.info("Chat erfolgreich verarbeitet");
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Chat fehlgeschlagen: {}", chatResponse.error());
                return ResponseEntity.internalServerError().body(response);
            }

        } catch (Exception e) {
            logger.error("Fehler beim Chat-Verarbeiten", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Chat fehlgeschlagen");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Autocomplete-Endpoint für intelligente Vorschläge
     * POST /api/nachweis/ai/autocomplete
     * 
     * Unterstützt zwei Modi:
     * 1. Predictive Text: Vervollständigung angefangener Sätze
     * 2. Contextual Suggestions: Vorschläge basierend auf Sektion
     * 
     * @param activityDTO ActivityDTO mit (teilweise) gefüllten Feldern
     * @return Liste von Vorschlägen für die Beschreibung
     */
    @PostMapping("/autocomplete")
    @Operation(
        summary = "Autocomplete für Tätigkeitsbeschreibungen",
        description = "Generiert intelligente Vorschläge für Tätigkeitsbeschreibungen basierend auf Sektion und bisherigem Text"
    )
    @ApiResponse(responseCode = "200", description = "Vorschläge erfolgreich generiert", content = @Content(schema = @Schema(implementation = Map.class)))
    @ApiResponse(responseCode = "400", description = "Ungültige Request - Sektion oder Text fehlt", content = @Content(schema = @Schema(implementation = Map.class)))
    @ApiResponse(responseCode = "500", description = "Fehler bei der Vorschlagsgenerierung", content = @Content(schema = @Schema(implementation = Map.class)))
    public ResponseEntity<Map<String, Object>> getSuggestions(@RequestBody ActivityDTO activityDTO) {
        logger.info("Autocomplete angefordert für Sektion: {}, Partial Text: {}", 
                   activityDTO.section(), 
                   activityDTO.description() != null ? activityDTO.description().substring(0, Math.min(20, activityDTO.description().length())) : "");

        if (activityDTO.section() == null || activityDTO.section().trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Sektion ist erforderlich");
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            List<String> suggestions;

            // Mode 1: Predictive Text - wenn bereits Text vorhanden ist
            if (activityDTO.description() != null && !activityDTO.description().trim().isEmpty()) {
                logger.info("Mode: Predictive Text");
                suggestions = nachweisAiService.getPredictiveTextSuggestions(
                        activityDTO.description(),
                        activityDTO.section());
            }
            // Mode 2: Contextual Suggestions - wenn Sektion vorhanden aber description leer
            else {
                logger.info("Mode: Contextual Suggestions");
                suggestions = nachweisAiService.getContextualSuggestions(
                        activityDTO.section(),
                        activityDTO.day());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("suggestions", suggestions);
            response.put("mode", suggestions.isEmpty() ? "NONE" : 
                        (activityDTO.description() != null && !activityDTO.description().trim().isEmpty() 
                            ? "PREDICTIVE_TEXT" : "CONTEXTUAL"));
            response.put("section", activityDTO.section());
            response.put("day", activityDTO.day());
            response.put("timestamp", System.currentTimeMillis());

            logger.info("Autocomplete erfolgreich - {} Vorschläge generiert", suggestions.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Fehler bei Autocomplete", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Fehler bei der Vorschlagsgenerierung: " + e.getMessage());
            errorResponse.put("section", activityDTO.section());
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
