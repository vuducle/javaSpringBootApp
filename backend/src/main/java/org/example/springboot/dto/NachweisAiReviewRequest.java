package org.example.springboot.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.UUID;

/**
 * DTO für AI-Review-Anfrage eines Nachweises
 */
@Schema(description = "Request für KI-basierte Bewertung eines Nachweises")
public record NachweisAiReviewRequest(
        @Schema(description = "UUID des Nachweises", example = "123e4567-e89b-12d3-a456-426614174000") UUID nachweisId,

        @Schema(description = "Liste der Aktivitäten des Nachweises") List<ActivityDTO> activities) {
}
