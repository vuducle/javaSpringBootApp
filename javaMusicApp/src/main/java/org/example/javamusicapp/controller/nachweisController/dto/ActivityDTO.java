package org.example.javamusicapp.controller.nachweisController.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.example.javamusicapp.model.enums.Weekday;

import java.math.BigDecimal;

@Data
public class ActivityDTO {
    @Schema(description = "Wochentag für die Aktivität", example = "MONDAY")
    private Weekday day;
    @Schema(description = "Zeitschlitz für die Aktivität (z.B. 1 für die erste Aufgabe des Tages)", example = "1")
    private Integer slot;
    @Schema(description = "Detaillierte Beschreibung der Aktivität", example = "Schule")
    private String description;
    @Schema(description = "Stunden, die für die Aktivität aufgewendet wurden", example = "8.0")
    private BigDecimal hours;
    @Schema(description = "Abteilung oder Bereich, in dem die Aktivität stattfand", example = "Theorie")
    private String section;
}
