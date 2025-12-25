package org.example.springboot.controller.backup.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupResult {
    private String filePath;
    private String fileName;
    private long fileSize;
    private LocalDateTime timestamp;
    private String status;
}