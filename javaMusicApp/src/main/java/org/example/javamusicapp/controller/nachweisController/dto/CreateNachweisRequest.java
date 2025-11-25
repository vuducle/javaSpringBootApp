package org.example.javamusicapp.controller.nachweisController.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CreateNachweisRequest {
    @Schema(description = "Start date of the Nachweis week", example = "2025-11-24")
    private LocalDate datumStart;
    @Schema(description = "End date of the Nachweis week", example = "2025-11-28")
    private LocalDate datumEnde;
    @Schema(description = "The number of the Nachweis", example = "42")
    private int nummer;
    @Schema(description = "List of activities for the week. If not provided, a default list will be created.")
    private List<ActivityDTO> activities;
    @Schema(description = "ID of the instructor (Ausbilder).", example = "e27590d3-657d-4feb-bd4e-1ffca3d7a884")
    private UUID ausbilderId;
}
