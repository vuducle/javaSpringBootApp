package org.example.springboot.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO für vollständige KI-Validierung eines Nachweises
 * Überprüft nicht nur Aktivitäten, sondern auch Metadaten wie Datum, Ausbildungsjahr, etc.
 */
@Schema(description = "Request für vollständige KI-Validierung eines kompletten Nachweises")
@JsonIgnoreProperties(ignoreUnknown = true)
public record NachweisAiValidationRequest(
        @Schema(description = "UUID des Nachweises", example = "123e4567-e89b-12d3-a456-426614174000") 
        UUID nachweisId,

        @Schema(description = "Name des Azubis", example = "Armin Dorri")
        String azubiName,

        @Schema(description = "Starttag des Nachweises", example = "2025-01-06") 
        LocalDate datumStart,

        @Schema(description = "Enddatum des Nachweises", example = "2025-01-10") 
        LocalDate datumEnde,

        @Schema(description = "Ausbildungsjahr (z.B. 1. Jahr, 2. Jahr, etc.)", example = "1")
        String ausbildungsjahr,

        @Schema(description = "Nummer des Nachweises", example = "5") 
        int nummer,

        @Schema(description = "Liste der Aktivitäten des Nachweises") 
        List<ActivityDTO> activities) {
}
