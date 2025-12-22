package org.example.springboot.controller.nachweisController.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * DTO für Batch-Operationen auf mehrere Nachweise
 */
@Data
public class BatchRequest {
    @NotEmpty(message = "Die Liste der Nachweis-IDs darf nicht leer sein")
    private List<UUID> nachweisIds;
}
