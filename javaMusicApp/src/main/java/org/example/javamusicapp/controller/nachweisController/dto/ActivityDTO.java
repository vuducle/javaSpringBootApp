package org.example.javamusicapp.controller.nachweisController.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.example.javamusicapp.model.enums.Weekday;

import java.math.BigDecimal;

@Data
public class ActivityDTO {
    @Schema(description = "Day of the week for the activity", example = "MONDAY")
    private Weekday day;
    @Schema(description = "Time slot for the activity (e.g., 1 for the first task of the day)", example = "1")
    private Integer slot;
    @Schema(description = "Detailed description of the activity", example = "Schule")
    private String description;
    @Schema(description = "Hours spent on the activity", example = "8.0")
    private BigDecimal hours;
    @Schema(description = "Department or section where the activity took place", example = "Theorie")
    private String section;
}
