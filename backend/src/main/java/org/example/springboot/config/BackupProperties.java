package org.example.springboot.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * Typed binding for `backup.*` properties defined in application.properties.
 * Having this class allows IDEs to resolve keys and Spring to bind safely.
 */
@Validated
@ConfigurationProperties(prefix = "backup")
public class BackupProperties {

    /**
     * Backups aktivieren/deaktivieren.
     */
    private boolean enabled = true;

    /**
     * Backup-Verzeichnis (absoluter Pfad).
     */
    @NotBlank
    private String directory = "/backups";

    /**
     * Alte Backups nach X Tagen löschen.
     */
    @Min(0)
    private int retentionDays = 30;

    /**
     * Cron-Expression für automatische Backups.
     * Format: Sekunde Minute Stunde Tag Monat Wochentag
     */
    @NotBlank
    private String scheduleCron = "0 0 2 * * 0"; // Jeden Sonntag um 2:00 Uhr

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getDirectory() {
        return directory;
    }

    public void setDirectory(String directory) {
        this.directory = directory;
    }

    public int getRetentionDays() {
        return retentionDays;
    }

    public void setRetentionDays(int retentionDays) {
        this.retentionDays = retentionDays;
    }

    public String getScheduleCron() {
        return scheduleCron;
    }

    public void setScheduleCron(String scheduleCron) {
        this.scheduleCron = scheduleCron;
    }
}
