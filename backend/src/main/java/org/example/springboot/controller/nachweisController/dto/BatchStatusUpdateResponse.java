package org.example.springboot.controller.nachweisController.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Response für Batch-Status-Update Operationen
 */
@Data
@AllArgsConstructor
public class BatchStatusUpdateResponse {
    private int updatedCount;
    private int failedCount;
    private List<UUID> failedIds;
    private String message;
}
