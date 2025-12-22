package org.example.springboot.controller.nachweisController.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.springboot.model.enums.EStatus;

import java.util.List;
import java.util.UUID;

/**
 * DTO für Batch-Status-Update von Nachweisen
 */
@Data
public class BatchStatusUpdateRequest {
    @NotEmpty(message = "Die Liste der Nachweis-IDs darf nicht leer sein")
    private List<UUID> nachweisIds;

    @NotNull(message = "Status darf nicht null sein")
    private EStatus status;

    // Kommentar ist optional
    private String comment;
}
