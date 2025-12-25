package org.example.springboot.controller.backup.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupInfo {
    private String filename;
    private long fileSize;
    private Date createdAt;
}
