package org.example.springboot.controller.backup;

import lombok.extern.slf4j.Slf4j;
import org.example.springboot.controller.backup.dto.BackupInfo;
import org.example.springboot.controller.backup.dto.BackupResult;
import org.example.springboot.service.backup.BackupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/backup")
@PreAuthorize("hasRole('ADMIN')")
public class BackupController {
    @Autowired
    private BackupService bp;

    /*
     * Manuelles Backup erstellen
     */
    @PostMapping("create")
    public ResponseEntity<BackupResult> createBackup() {
        try {
            BackupResult result = bp.performBackup();
            return ResponseEntity.ok(result);
        } catch (IOException | InterruptedException e) {
            log.error("Backup creation failed", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Alle Backups auflisten
     */
    @GetMapping("/list")
    public ResponseEntity<List<BackupInfo>> listBackups() {
        try {
            List<BackupInfo> backups = bp.listBackups();
            return ResponseEntity.ok(backups);
        } catch (IOException e) {
            log.error("Error listing backups", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Backup wiederherstellen
     */
    @PostMapping("/restore/{filename}")
    public ResponseEntity<String> restoreBackup(@PathVariable String filename) {
        try {
            bp.restoreBackup(filename);
            return ResponseEntity.ok("Backup restored successfully: " + filename);
        } catch (IOException | InterruptedException e) {
            log.error("Restore failed", e);
            return ResponseEntity.internalServerError().body("Restore failed: " + e.getMessage());
        }
    }

    /**
     * Backup löschen
     */
    @DeleteMapping("/delete/{filename}")
    public ResponseEntity<String> deleteBackup(@PathVariable String filename) {
        try {
            bp.deleteBackup(filename);
            return ResponseEntity.ok("Backup deleted: " + filename);
        } catch (IOException e) {
            log.error("Delete backup failed", e);
            return ResponseEntity.internalServerError().body("Delete failed: " + e.getMessage());
        }
    }
}
