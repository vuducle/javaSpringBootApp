package org.example.springboot.model.record;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Ergebnis der KI-Bewertung eines Nachweises")
public record ReviewResult(
                @Schema(description = "Wurde der Nachweis akzeptiert?", example = "true") boolean akzeptiert,

                @Schema(description = "Status der Bewertung", example = "AKZEPTIERT") String status,

                @Schema(description = "Feedback der KI zum Nachweis", example = "Sehr gute Arbeit! Die Aktivitäten zeigen gute Fortschritte.") String feedback,

                @Schema(description = "Liste der erkannten Skills und Technologien") List<String> gefundeneSkills,

                @Schema(description = "Warnungen und Hinweise (z.B. zu viele/wenige Stunden)") List<String> warnungen) {
}
