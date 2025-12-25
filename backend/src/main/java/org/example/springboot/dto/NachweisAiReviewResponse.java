package org.example.springboot.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * DTO für AI-Review-Response eines Nachweises
 */
@Schema(description = "Response mit dem Ergebnis der KI-Bewertung")
public record NachweisAiReviewResponse(
        @Schema(description = "Wurde der Nachweis akzeptiert?", example = "true") boolean akzeptiert,

        @Schema(description = "Status der Bewertung", example = "AKZEPTIERT") String status,

        @Schema(description = "Feedback der KI zum Nachweis", example = "Sehr gute Arbeit!") String feedback,

        @Schema(description = "Liste der erkannten Skills und Technologien") List<String> gefundeneSkills,

        @Schema(description = "Warnungen und Hinweise") List<String> warnungen) {
}
