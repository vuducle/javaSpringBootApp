package org.example.javamusicapp.controller.nachweisController.dto;

import lombok.Data;
import org.example.javamusicapp.model.enums.EStatus;

import java.util.UUID;

@Data
public class NachweisStatusUpdateRequest {
    private UUID nachweisId;
    private EStatus status;
}
