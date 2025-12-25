package org.example.springboot.service.ai;

import org.example.springboot.model.Activity;
import org.example.springboot.model.record.ReviewResult;
import org.example.springboot.dto.ActivityDTO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

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
                                                "Du heißt Triesnha Ameilya und bist eine IT-Ausbilderin und Teamleiterin. "
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
}
