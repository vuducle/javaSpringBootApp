package org.example.springboot.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

/**
 * DTO für Activity-Daten zum Übermitteln an die KI
 */
@Schema(description = "Aktivität eines einzelnen Tages im Ausbildungsnachweis")
@JsonIgnoreProperties(ignoreUnknown = true)
public record ActivityDTO(
        @Schema(description = "Wochentag der Aktivität", example = "Montag") String day,

        @Schema(description = "Anzahl der Stunden", example = "8") BigDecimal hours,

        @Schema(description = "Beschreibung der Aktivität", example = "Entwicklung eines REST-APIs mit Spring Boot") String description,

        @Schema(description = "Bereich/Abteilung", example = "Backend") String section) {
}
