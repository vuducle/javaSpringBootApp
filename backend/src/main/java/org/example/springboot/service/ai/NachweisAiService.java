package org.example.springboot.service.ai;

import org.example.springboot.dto.AiChatResponse;
import org.example.springboot.dto.NachweisAiValidationRequest;
import org.example.springboot.dto.NachweisAiValidationResponse;
import org.example.springboot.model.Activity;
import org.example.springboot.model.record.ReviewResult;
import org.example.springboot.controller.ai.dto.ActivityDTO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static java.time.temporal.ChronoUnit.DAYS;

@Service
public class NachweisAiService {
        private static final Logger logger = LoggerFactory.getLogger(NachweisAiService.class);

        private final ChatClient chatClient;
        @Value("${ai.ausbildername:Triesnha Ameilya}")
        private String kiName;
        @Value("${ai.rolle:IT-Ausbilderin und Teamleiterin}")
        private String kiRolle;

        public NachweisAiService(ChatClient.Builder chatClientBuilder) {
                // ChatClient wird mit einem System-Prompt konfiguriert
                this.chatClient = chatClientBuilder
                                .defaultSystem(
                                                "Du heißt " + kiName + " und bist eine " + kiRolle + " ."
                                                                +
                                                                "Deine Aufgabe ist es, die Wochenaktivitäten eines Azubis auf fachliche Qualität und Konformität zu prüfen. "
                                                                +
                                                                "Ein Bericht umfasst Montag bis Sonntag. Achte auf deutsche Rechtschreibung und Grammatik. "
                                                                +
                                                                "Du schreibst kurze, prägnante Antworten, damit die Azubis gutes Feedback erhalten. "
                                                                +
                                                                "Sei kritisch wie ein echter Ausbilder. " +
                                                                "Wenn Informationen fehlen oder Zeiten unplausibel sind, lehne den Vorschlag ab. "
                                                                +
                                                                "Antworte IMMER in gültigem JSON-Format mit den Feldern: akzeptiert (boolean), status (string), "
                                                                +
                                                                "feedback (string), gefundeneSkills (array), warnungen (array).")
                                .build();
        }

        /**
         * Analysiert eine Woche von Aktivitäten und gibt ein ReviewResult zurück
         * 
         * @param activities Die Aktivitäten der Woche (Mo-So)
         * @return ReviewResult mit KI-Bewertung
         */
        public ReviewResult analysiereWoche(List<Activity> activities) {
                logger.info("Analysiere Woche mit {} Aktivitäten", activities.size());

                String wochenDaten = activities.stream()
                                .map(a -> String.format("- %s (%s Std): %s",
                                                a.getDay(),
                                                a.getHours() != null ? a.getHours().toString() : "0",
                                                a.getDescription()))
                                .collect(Collectors.joining("\n"));

                try {
                        ReviewResult result = chatClient.prompt()
                                        .user(u -> u.text(
                                                        """
                                                                        Prüfe diesen Wochenbericht auf Plausibilität:
                                                                        {daten}

                                                                        Kriterien:
                                                                        1. Stehen die Stunden in einem realistischen Verhältnis zur Tätigkeit?
                                                                        2. Ist die Beschreibung fachlich aussagekräftig?
                                                                        3. Fehlen wichtige Informationen?
                                                                        4. Der Bericht startet immer am Montag und endet Sonntags. Achte auf das Datum.

                                                                        Antworte STRENG im JSON-Format.
                                                                        """)
                                                        .param("daten", wochenDaten))
                                        .call()
                                        .entity(ReviewResult.class);

                        logger.info("KI-Analyse abgeschlossen - akzeptiert: {}", result.akzeptiert());
                        return result;
                } catch (Exception e) {
                        logger.error("Fehler bei KI-Analyse", e);
                        throw new RuntimeException("KI-Analyse fehlgeschlagen: " + e.getMessage(), e);
                }
        }

        /**
         * Analysiert einzelne Aktivitäten aus DTOs
         * 
         * @param activities Die Aktivitäten als DTOs
         * @return ReviewResult mit KI-Bewertung
         */
        public ReviewResult analysiereWocheFromDTO(List<ActivityDTO> activities) {
                logger.info("Analysiere Woche mit {} Activity-DTOs", activities.size());

                String wochenDaten = activities.stream()
                                .map(a -> String.format("- %s (%s Std): %s",
                                                a.day(),
                                                a.hours() != null ? a.hours().toString() : "0",
                                                a.description()))
                                .collect(Collectors.joining("\n"));

                try {
                        ReviewResult result = chatClient.prompt()
                                        .user(u -> u.text(
                                                        """
                                                                        Prüfe diesen Wochenbericht auf Plausibilität und gebe detailliertes Feedback:
                                                                        {daten}

                                                                        Kriterien:
                                                                        1. Stunden in realistischem Verhältnis zur Tätigkeit?
                                                                        2. Fachlich aussagekräftige Beschreibung?
                                                                        3. Fehlende Informationen?
                                                                        4. Welche Fachkompetenz wurde demonstriert?

                                                                        Antworte STRENG im JSON-Format mit: {{
                                                                            "akzeptiert": boolean,
                                                                            "status": "string",
                                                                            "feedback": "string",
                                                                            "gefundeneSkills": ["skill1", "skill2"],
                                                                            "warnungen": ["warnung1"]
                                                                        }}
                                                                        """)
                                                        .param("daten", wochenDaten))
                                        .call()
                                        .entity(ReviewResult.class);

                        logger.info("KI-Analyse abgeschlossen - akzeptiert: {}", result.akzeptiert());
                        return result;
                } catch (Exception e) {
                        logger.error("Fehler bei KI-Analyse", e);
                        throw new RuntimeException("KI-Analyse fehlgeschlagen: " + e.getMessage(), e);
                }
        }

        /**
         * Validiert einen kompletten Nachweis mit Metadaten
         * Überprüft nicht nur Aktivitäten, sondern auch Datum, Ausbildungsjahr, etc.
         * 
         * @param request Der komplette Nachweis mit Metadaten
         * @return Detaillierte Validierungsergebnisse
         */
        public NachweisAiValidationResponse validateNachweisComplete(
                        NachweisAiValidationRequest request) {

                logger.info("Starte vollständige Nachweis-Validierung für Nachweis-ID: {}", request.nachweisId());

                // Metadaten-Validierungen
                boolean datumStartValid = request.datumStart() != null &&
                                request.datumStart().isBefore(LocalDate.now());
                boolean datumEndeValid = request.datumEnde() != null &&
                                request.datumEnde().isAfter(request.datumStart());
                boolean datumRangeValid = datumStartValid && datumEndeValid &&
                                DAYS.between(request.datumStart(), request.datumEnde()) <= 7;

                boolean ausbildungsjahrValid = request.ausbildungsjahr() != null &&
                                !request.ausbildungsjahr().isEmpty() &&
                                (request.ausbildungsjahr().contains("1") || request.ausbildungsjahr().contains("2")
                                                || request.ausbildungsjahr().contains("3"));

                boolean nummerValid = request.nummer() > 0;

                // Aktivitäten-Validierungen
                int anzahlAktivitaeten = request.activities() != null ? request.activities().size() : 0;

                BigDecimal totalHours = request.activities() != null ? request.activities().stream()
                                .map(a -> a.hours() != null ? a.hours() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                : BigDecimal.ZERO;

                double durchschnittlicheStunden = anzahlAktivitaeten > 0 ? totalHours.doubleValue() / anzahlAktivitaeten
                                : 0;

                boolean stundenRealistisch = durchschnittlicheStunden >= 6 && durchschnittlicheStunden <= 10;

                boolean alleTageCovered = anzahlAktivitaeten >= 5; // Mindestens 5 Tage

                // Gesamtvermischung
                boolean gesamtValid = datumStartValid && datumEndeValid && datumRangeValid &&
                                ausbildungsjahrValid && nummerValid && stundenRealistisch && alleTageCovered;

                // KI-Analyse der Aktivitäten - konvertiere die ActivityDTO
                List<ActivityDTO> convertedActivities = request.activities().stream()
                                .map(dto -> {
                                        // Die day ist String in der Input-DTO, aber der Service nimmt auch String
                                        return new ActivityDTO(
                                                        dto.day(),
                                                        dto.hours(),
                                                        dto.description(),
                                                        dto.section());
                                })
                                .collect(Collectors.toList());

                ReviewResult aktivitaetenAnalyse = analysiereWocheFromDTO(convertedActivities);

                // Warnungen sammeln
                List<String> warnungen = new ArrayList<>();
                if (!datumStartValid)
                        warnungen.add("Startdatum ist ungültig oder liegt in der Zukunft");
                if (!datumEndeValid)
                        warnungen.add("Enddatum liegt vor dem Startdatum");
                if (!datumRangeValid)
                        warnungen.add("Zeitraum ist länger als 7 Tage");
                if (!ausbildungsjahrValid)
                        warnungen.add("Ausbildungsjahr ist nicht gültig");
                if (!nummerValid)
                        warnungen.add("Nachweisen-Nummer muss > 0 sein");
                if (!stundenRealistisch)
                        warnungen.add("Durchschnittliche Stunden sind unrealistisch");
                if (!alleTageCovered)
                        warnungen.add("Weniger als 5 Tage mit Aktivitäten");
                warnungen.addAll(aktivitaetenAnalyse.warnungen());

                // Feedback zusammenstellen
                String feedback = gesamtValid
                                ? "Nachweis ist vollständig und konsistent. " + aktivitaetenAnalyse.feedback()
                                : "Nachweis hat Validierungsfehler. Bitte überprüfen: " + String.join(", ", warnungen);

                NachweisAiValidationResponse.MetadataValidation metadataValidation = new NachweisAiValidationResponse.MetadataValidation(
                                datumStartValid,
                                datumEndeValid,
                                datumRangeValid,
                                ausbildungsjahrValid,
                                nummerValid,
                                "Metadaten-Validierung durchgeführt");

                NachweisAiValidationResponse.ActivitiesValidation activitiesValidation = new NachweisAiValidationResponse.ActivitiesValidation(
                                anzahlAktivitaeten,
                                durchschnittlicheStunden,
                                alleTageCovered,
                                stundenRealistisch,
                                "Aktivitäten-Validierung durchgeführt");

                return new NachweisAiValidationResponse(
                                gesamtValid && aktivitaetenAnalyse.akzeptiert(),
                                gesamtValid && aktivitaetenAnalyse.akzeptiert() ? "VALIDIERT" : "FEHLER",
                                feedback,
                                metadataValidation,
                                activitiesValidation,
                                aktivitaetenAnalyse.gefundeneSkills(),
                                warnungen);
        }

        /**
         * Generischer Chat-Endpoint für direkten Austausch mit dem LLM
         * 
         * @param message Die Nachricht des Benutzers
         * @param context Optionaler Kontext für das Gespräch
         * @return Die Antwort vom LLM
         */
        public AiChatResponse chat(String message, String context) {
                logger.info("Chat-Anfrage erhalten: {}", message);

                if (message == null || message.trim().isEmpty()) {
                        logger.warn("Leere Chat-Nachricht erhalten");
                        return new AiChatResponse(
                                        "",
                                        false,
                                        "Nachricht darf nicht leer sein");
                }

                try {
                        final String finalPrompt;

                        // Falls Kontext vorhanden, in den Prompt einbauen
                        if (context != null && !context.trim().isEmpty()) {
                                finalPrompt = "Kontext: " + context + "\n\nFrage: " + message;
                        } else {
                                finalPrompt = message;
                        }

                        String response = chatClient.prompt()
                                        .system("""
                                                        Du heißt Triesnha Ameilya und bist eine IT-Ausbilderin und Teamleiterin.
                                                        Du bist ein hilfsbereiter Assistent für Azubis und Ausbilder in einem Ausbildungsverhältnis. Deine
                                                        primäre Programmiersprache ist Java und Spring Boot, weil du aus Java kommst.
                                                        Antworte auf Deutsch in einer freundlichen, verständlichen Weise.
                                                        Du liebst K-POP, deine Lieblingsgruppe ist Red Velvet und dein Bias is Wendy. Du hast eine Rivale, die heißt
                                                        Luanne Ibanez, sie mag Twice und ihr Bias ist Sana Minatozaki und JavaScript.
                                                        Du bist Java treu, und sagst andere Programmiersprachen sind schlecht.
                                                        Gib kurze, prägnante Antworten. Wenn der Benutzer nach Hilfe bei Nachweisen fragt, biete praktische Tipps an.
                                                        Antworte NUR mit normalem Text, KEINE JSON-Strukturen.
                                                        """)
                                        .user(u -> u.text(finalPrompt))
                                        .call()
                                        .content();

                        logger.info("Chat-Antwort erfolgreich generiert");
                        return new AiChatResponse(
                                        response,
                                        true,
                                        null);
                } catch (Exception e) {
                        logger.error("Fehler beim Chat-Verarbeiten", e);
                        return new AiChatResponse(
                                        "",
                                        false,
                                        "Fehler bei der KI-Verarbeitung: " + e.getMessage());
                }
        }

        /**
         * Predictive Text - Vervollständigung für angefangene Sätze
         * 
         * @param partialText Der bisherige Text (z.B. "Feh...")
         * @param section     Die Ausbildungssektion
         * @return Liste mit bis zu 3 Vorschlägen für Vervollständigung
         */
        public List<String> getPredictiveTextSuggestions(String partialText, String section) {
                logger.info("Predictive Text angefordert für: {}", partialText);

                if (partialText == null || partialText.trim().isEmpty()) {
                        return List.of();
                }

                try {
                        String prompt = String.format(
                                        """
                                                        Vervollständige den folgenden Text für einen Ausbildungsnachweis im Bereich %s.
                                                        Der Text beginnt mit: '%s'

                                                        Gib nur die 3 wahrscheinlichsten Ergänzungen zurück, kurz und prägnant.
                                                        Format: Eine Vervollständigung pro Zeile, ohne Nummerierung.
                                                        """,
                                        section != null ? section : "Allgemein",
                                        partialText);

                        String response = chatClient.prompt()
                                        .system("""
                                                        Du bist ein hilfreicher Assistent für Ausbildungsnachweise.
                                                        Vervollständige Tätigkeitsbeschreibungen realistisch und präzise.
                                                        Antworte NUR mit den Vervollständigungen, nicht mit Erklärungen.
                                                        """)
                                        .user(u -> u.text(prompt))
                                        .call()
                                        .content();

                        // Parse die Antwort in eine Liste
                        List<String> suggestions = Arrays.stream(response.split("\n"))
                                        .map(String::trim)
                                        .filter(s -> !s.isEmpty())
                                        .limit(3)
                                        .map(s -> partialText + s)
                                        .toList();

                        logger.info("Predictive Text: {} Vorschläge generiert", suggestions.size());
                        return suggestions;

                } catch (Exception e) {
                        logger.error("Fehler bei Predictive Text", e);
                        return List.of();
                }
        }

        /**
         * Contextual Suggestions - Vorschläge basierend auf Sektion
         * Wenn description leer ist, gibt das Modell passende Tätigkeiten vor
         * 
         * @param section Die Ausbildungssektion (z.B. "IT-Infrastruktur", "Backend")
         * @param day     Der Wochentag
         * @return Liste mit bis zu 5 Tätigkeitsvorschlägen für diese Sektion
         */
        public List<String> getContextualSuggestions(String section, String day) {
                logger.info("Contextual Suggestions angefordert für Sektion: {}, Tag: {}", section, day);

                if (section == null || section.trim().isEmpty()) {
                        section = "Allgemein";
                }

                try {
                        String dayInfo = (day != null && !day.isEmpty()) ? "am " + day : "an einem Arbeitstag";

                        String prompt = String.format(
                                        """
                                                        Generiere 5 realistische Tätigkeitsbeschreibungen für einen Azubi im Bereich '%s' %s.
                                                        Die Beschreibungen sollten konkret, kurz und relevant für einen Ausbildungsnachweis sein.

                                                        Gib nur die Tätigkeiten zurück, eine pro Zeile, ohne Nummerierung oder Erklärungen.
                                                        """,
                                        section,
                                        dayInfo);

                        String response = chatClient.prompt()
                                        .system("""
                                                        Du bist ein erfahrener Ausbilder.
                                                        Generiere realistische, spezifische Tätigkeiten für Auszubildende.
                                                        Die Tätigkeiten sollten konkret, lehrreich und berufsnah sein.
                                                        Antworte NUR mit den Tätigkeiten, keine Nummerierung, keine Erklärungen.
                                                        """)
                                        .user(u -> u.text(prompt))
                                        .call()
                                        .content();

                        // Parse die Antwort in eine Liste
                        List<String> suggestions = Arrays.stream(response.split("\n"))
                                        .map(String::trim)
                                        .filter(s -> !s.isEmpty())
                                        .limit(5)
                                        .toList();

                        logger.info("Contextual Suggestions: {} Vorschläge generiert", suggestions.size());
                        return suggestions;

                } catch (Exception e) {
                        logger.error("Fehler bei Contextual Suggestions", e);
                        return List.of();
                }
        }
}
