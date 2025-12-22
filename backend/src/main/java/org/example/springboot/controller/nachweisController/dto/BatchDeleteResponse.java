package org.example.springboot.controller.nachweisController.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Response für Batch-Delete Operationen
 */
@Data
@AllArgsConstructor
public class BatchDeleteResponse {
    private int deletedCount;
    private int failedCount;
    private List<UUID> failedIds;
    private String message;
}
