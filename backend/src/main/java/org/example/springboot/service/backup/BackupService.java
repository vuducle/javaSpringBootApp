package org.example.springboot.service.backup;

import lombok.extern.slf4j.Slf4j;
import org.example.springboot.config.BackupProperties;
import org.example.springboot.controller.backup.dto.BackupInfo;
import org.example.springboot.controller.backup.dto.BackupResult;
import org.example.springboot.repository.BackupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class BackupService {
    
    private final BackupProperties backupProperties;
    
    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    @Autowired(required = false)
    private BackupRepository backupRepository;
    
    public BackupService(BackupProperties backupProperties) {
        this.backupProperties = backupProperties;
    }

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    /**
     * Automatisches Backup jeden Sonntag um 2:00 Uhr
     * Cron: Minute Hour DayOfMonth Month DayOfWeek
     * 0 2 * * 0 = Every Sunday at 2:00 AM
     */
    @Scheduled(cron = "${backup.schedule.cron:0 2 * * 0}")
    public void scheduleWeeklyBackup() {
        if (!backupProperties.isEnabled()) {
            log.info("Backups sind deaktiviert");
            return;
        }
        log.info("Starting scheduled weekly backup...");
        try {
            BackupResult result = performBackup();
            log.info("Weekly backup completed successfully: {}", result.getFilePath());

            // Speichere Backup-Metadaten in DB
            if (backupRepository != null) {
                saveBackupMetadata(result);
            }

            // Lösche alte Backups
            cleanupOldBackups();
        } catch (Exception e) {
            log.error("Weekly backup FAILED!", e);
        }
    }

    /**
     * Manuelles Backup erstellen
     * Archiviert: Datenbank-Dump + generated_pdfs + uploads Verzeichnisse
     */
    public BackupResult performBackup() throws IOException, InterruptedException {
        // Backup-Verzeichnis erstellen
        Path backupDir = Paths.get(backupProperties.getDirectory());
        Files.createDirectories(backupDir);

        // Dateiname mit Timestamp
        String timestamp = LocalDateTime.now().format(FORMATTER);
        String filename = "nachweise_backup_" + timestamp + ".tar.gz";
        Path backupFile = backupDir.resolve(filename);
        
        // Temporäre Verzeichnis für DB-Dump
        Path tempDir = Files.createTempDirectory("backup_");
        Path dbDumpFile = tempDir.resolve("database.sql.gz");

        log.info("Starting backup to: {}", backupFile.toAbsolutePath());

        // 1. Datenbank-Dump erstellen
        createDatabaseDump(dbDumpFile);

        // 2. Alles in tar.gz archivieren (DB + Dateisystem)
        createTarArchive(backupFile, tempDir, dbDumpFile);

        // 3. Temp-Verzeichnis aufräumen
        deleteRecursively(tempDir);

        long fileSize = Files.size(backupFile);
        log.info("Backup completed. File size: {} bytes", fileSize);

        // Speichern von Metadaten in Datenbank ist optional
        // saveBackupMetadata(result);

        return BackupResult.builder()
                .filePath(backupFile.toString())
                .fileName(filename)
                .fileSize(fileSize)
                .timestamp(LocalDateTime.now())
                .status("SUCCESS")
                .build();
    }

    /**
     * Erstellt einen PostgreSQL-Dump und komprimiert ihn
     */
    private void createDatabaseDump(Path outputFile) throws IOException, InterruptedException {
        // pg_dump Befehl ausführen
        ProcessBuilder pb = new ProcessBuilder(
                "pg_dump",
                "-h", extractHost(),
                "-U", datasourceUsername,
                "-d", extractDatabase(),
                "-F", "plain"
        );

        // Umgebungsvariable für Passwort
        Map<String, String> env = pb.environment();
        env.put("PGPASSWORD", datasourcePassword);

        // Output zu gzip pipen
        pb.redirectErrorStream(true);
        Process pgDump = pb.start();
        
        Process gzip = new ProcessBuilder("gzip")
                .redirectOutput(outputFile.toFile())
                .start();
        
        // Stream manuell verbinden
        InputStream pgDumpOut = pgDump.getInputStream();
        OutputStream gzipIn = gzip.getOutputStream();
        new Thread(() -> {
            try {
                byte[] buffer = new byte[1024];
                int read;
                while ((read = pgDumpOut.read(buffer)) != -1) {
                    gzipIn.write(buffer, 0, read);
                }
                gzipIn.close();
            } catch (IOException e) {
                log.error("Error piping pg_dump to gzip", e);
            }
        }).start();

        int exitCode = gzip.waitFor();
        pgDump.waitFor();

        if (exitCode != 0) {
            throw new RuntimeException("Database backup failed with exit code: " + exitCode);
        }
        
        log.info("Database dump created: {}", outputFile);
    }

    /**
     * Erstellt ein tar.gz Archiv mit:
     * - database.sql.gz (DB-Dump)
     * - generated_pdfs/ (Falls vorhanden)
     * - uploads/ (Falls vorhanden)
     */
    private void createTarArchive(Path outputFile, Path tempDir, Path dbDumpFile) throws IOException {
        try {
            // Absolute Pfade für alle Verzeichnisse ermitteln
            String backendDir = System.getProperty("user.dir");
            Path generatedPdfsDir = Paths.get(backendDir, "generated_pdfs");
            Path uploadsDir = Paths.get(backendDir, "uploads");
            
            // Baue tar Befehl mit ALLEN Dateien auf einmal
            List<String> tarCmd = new ArrayList<>();
            tarCmd.add("tar");
            tarCmd.add("-czf");
            tarCmd.add(outputFile.toAbsolutePath().toString());
            
            // Datenbank-Dump hinzufügen (aus tempDir)
            tarCmd.add("-C");
            tarCmd.add(tempDir.toAbsolutePath().toString());
            tarCmd.add("database.sql.gz");
            
            // Generierte PDFs hinzufügen wenn vorhanden (mit absoluten Pfaden)
            if (Files.exists(generatedPdfsDir) && Files.isDirectory(generatedPdfsDir)) {
                log.info("Including generated_pdfs in backup");
                tarCmd.add("-C");
                tarCmd.add(backendDir);  // Absoluter Pfad zum Backend
                tarCmd.add("generated_pdfs");
            }

            // Uploads hinzufügen wenn vorhanden (mit absoluten Pfaden)
            if (Files.exists(uploadsDir) && Files.isDirectory(uploadsDir)) {
                log.info("Including uploads in backup");
                tarCmd.add("-C");
                tarCmd.add(backendDir);  // Absoluter Pfad zum Backend
                tarCmd.add("uploads");
            }

            // Führe tar Befehl aus
            ProcessBuilder pb = new ProcessBuilder(tarCmd);
            
            int exitCode = pb.start().waitFor();
            
            if (exitCode != 0) {
                log.error("Failed to create tar archive with exit code: {}", exitCode);
                log.error("Tar command: {}", String.join(" ", tarCmd));
                throw new RuntimeException("Tar archive creation failed with exit code: " + exitCode);
            }

            if (Files.exists(outputFile)) {
                log.info("Tar archive successfully created: {}", outputFile.toAbsolutePath());
            } else {
                throw new IOException("Tar archive file was not created");
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Tar creation was interrupted", e);
        }
    }

    /**
     * Rekursiv Verzeichnis löschen
     */
    private void deleteRecursively(Path path) throws IOException {
        if (!Files.exists(path)) {
            return;
        }
        
        if (Files.isDirectory(path)) {
            Files.walk(path)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try {
                            Files.delete(p);
                        } catch (IOException e) {
                            log.warn("Failed to delete: {}", p, e);
                        }
                    });
        } else {
            Files.delete(path);
        }
    }

    /**
     * Backup wiederherstellen (tar.gz Format)
     * Extrahiert Datenbank-Dump + PDFs + Bilder
     */
    public void restoreBackup(String filename) throws IOException, InterruptedException {
        Path backupFile = Paths.get(backupProperties.getDirectory(), filename);

        if (!Files.exists(backupFile)) {
            throw new FileNotFoundException("Backup file not found: " + filename);
        }

        log.info("Starting restore from: {}", backupFile.toAbsolutePath());

        // Temporäres Verzeichnis zum Extrahieren
        Path extractDir = Files.createTempDirectory("restore_");
        
        try {
            // Step 1: tar.gz extrahieren
            log.info("Extracting tar archive...");
            ProcessBuilder pbTar = new ProcessBuilder(
                    "tar",
                    "-xzf",
                    backupFile.toAbsolutePath().toString(),
                    "-C",
                    extractDir.toAbsolutePath().toString()
            );
            
            int exitCode = pbTar.start().waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("Tar extraction failed with exit code: " + exitCode);
            }
            log.info("Tar archive extracted");

            // Step 2: Datenbank LÖSCHEN und neu erstellen
            log.info("Cleaning database before restore...");
            String dbName = extractDatabase();
            ProcessBuilder pbDropDb = new ProcessBuilder(
                    "psql",
                    "-h", extractHost(),
                    "-U", datasourceUsername,
                    "-d", "postgres",  // Verbinde zu default DB
                    "-c", "DROP DATABASE IF EXISTS \"" + dbName + "\" WITH (FORCE);"
            );
            
            Map<String, String> envDrop = pbDropDb.environment();
            envDrop.put("PGPASSWORD", datasourcePassword);
            
            int dropExitCode = pbDropDb.start().waitFor();
            if (dropExitCode != 0) {
                log.warn("Warning: Failed to drop database, continuing with restore");
            } else {
                log.info("Database dropped successfully");
            }
            
            // Kurze Pause
            Thread.sleep(500);
            
            // Datenbank-Dump wiederherstellen
            Path dbDumpFile = extractDir.resolve("database.sql.gz");
            if (!Files.exists(dbDumpFile)) {
                throw new FileNotFoundException("database.sql.gz not found in backup");
            }
            
            log.info("Restoring database from dump...");
            ProcessBuilder pbZcat = new ProcessBuilder("zcat", dbDumpFile.toString());
            pbZcat.redirectErrorStream(true);
            Process zcat = pbZcat.start();

            ProcessBuilder pbPsql = new ProcessBuilder(
                    "psql",
                    "-h", extractHost(),
                    "-U", datasourceUsername,
                    "-d", "postgres",  // Stelle in postgres DB wieder her (wird CREATE DATABASE Befehle enthalten)
                    "-v", "ON_ERROR_STOP=1"
            );

            Map<String, String> env = pbPsql.environment();
            env.put("PGPASSWORD", datasourcePassword);

            Process psql = pbPsql.start();
            
            // Streams verbinden
            InputStream zcatOut = zcat.getInputStream();
            OutputStream psqlIn = psql.getOutputStream();
            new Thread(() -> {
                try {
                    byte[] buffer = new byte[1024];
                    int read;
                    while ((read = zcatOut.read(buffer)) != -1) {
                        psqlIn.write(buffer, 0, read);
                    }
                    psqlIn.close();
                } catch (IOException e) {
                    log.error("Error piping zcat to psql", e);
                }
            }).start();

            int exitCode2 = psql.waitFor();
            zcat.waitFor();

            if (exitCode2 != 0) {
                throw new RuntimeException("Database restore failed with exit code: " + exitCode2);
            }
            log.info("Database restore completed successfully");

            // Step 3: Dateien zurückkopieren (PDFs, Bilder) mit absoluten Pfaden
            String backendDir = System.getProperty("user.dir");
            Path extractedPdfs = extractDir.resolve("generated_pdfs");
            if (Files.exists(extractedPdfs)) {
                log.info("Restoring generated PDFs...");
                Path targetPdfs = Paths.get(backendDir, "generated_pdfs");
                deleteRecursively(targetPdfs);
                Files.createDirectories(targetPdfs);
                copyDirectory(extractedPdfs, targetPdfs);
                log.info("PDFs restored successfully to: {}", targetPdfs.toAbsolutePath());
            } else {
                log.info("No generated_pdfs found in backup");
            }

            Path extractedUploads = extractDir.resolve("uploads");
            if (Files.exists(extractedUploads)) {
                log.info("Restoring uploads...");
                Path targetUploads = Paths.get(backendDir, "uploads");
                deleteRecursively(targetUploads);
                Files.createDirectories(targetUploads);
                copyDirectory(extractedUploads, targetUploads);
                log.info("Uploads restored successfully to: {}", targetUploads.toAbsolutePath());
            } else {
                log.info("No uploads found in backup");
            }

            log.info("Restore completed successfully");
            
        } finally {
            // Cleanup temp directory
            deleteRecursively(extractDir);
        }
    }

    /**
     * Rekursiv Verzeichnis kopieren
     */
    private void copyDirectory(Path source, Path target) throws IOException {
        Files.walk(source)
                .forEach(path -> {
                    try {
                        Path targetPath = target.resolve(source.relativize(path));
                        if (Files.isDirectory(path)) {
                            Files.createDirectories(targetPath);
                        } else {
                            Files.copy(path, targetPath);
                        }
                    } catch (IOException e) {
                        log.error("Error copying file: {}", path, e);
                    }
                });
    }

    /**
     * Alle verfügbaren Backups auflisten (tar.gz Format)
     */
    public List<BackupInfo> listBackups() throws IOException {
        Path backupDir = Paths.get(backupProperties.getDirectory());

        if (!Files.exists(backupDir)) {
            return Collections.emptyList();
        }

        return Files.list(backupDir)
                .filter(path -> path.toString().endsWith(".tar.gz"))
                .map(path -> {
                    try {
                        return BackupInfo.builder()
                                .filename(path.getFileName().toString())
                                .fileSize(Files.size(path))
                                .createdAt(new Date(Files.getLastModifiedTime(path).toMillis()))
                                .build();
                    } catch (IOException e) {
                        log.error("Error reading backup file: {}", path, e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(BackupInfo::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Backup-Datei löschen
     */
    public void deleteBackup(String filename) throws IOException {
        Path backupFile = Paths.get(backupProperties.getDirectory(), filename);

        if (!Files.exists(backupFile)) {
            throw new FileNotFoundException("Backup file not found: " + filename);
        }

        Files.delete(backupFile);
        log.info("Backup deleted: {}", filename);
    }

    /**
     * Alte Backups automatisch löschen (älter als retention days)
     */
    private void cleanupOldBackups() throws IOException {
        Path backupDir = Paths.get(backupProperties.getDirectory());

        if (!Files.exists(backupDir)) {
            return;
        }

        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(backupProperties.getRetentionDays());

        Files.list(backupDir)
                .filter(path -> path.toString().endsWith(".sql.gz"))
                .forEach(path -> {
                    try {
                        LocalDateTime fileTime = LocalDateTime.ofInstant(
                                new Date(Files.getLastModifiedTime(path).toMillis()).toInstant(),
                                java.time.ZoneId.systemDefault()
                        );

                        if (fileTime.isBefore(cutoffDate)) {
                            Files.delete(path);
                            log.info("Deleted old backup: {}", path.getFileName());
                        }
                    } catch (IOException e) {
                        log.error("Error processing backup file: {}", path, e);
                    }
                });
    }

    /**
     * Speichere Backup-Metadaten in Datenbank (deaktiviert)
     * Diese Funktionalität benötigt die backup_metadata Entity, 
     * die Datenbank-Schema-Abhängigkeiten verursacht beim Startup
     */
    private void saveBackupMetadata(BackupResult result) {
        log.debug("Backup metadata persistence is disabled (optional feature)");
        // BackupMetaData persistence disabled to avoid schema validation errors
    }

    /**
     * Host aus JDBC-URL extrahieren
     */
    private String extractHost() {
        // jdbc:postgresql://localhost:5432/nachweise_db
        String host = datasourceUrl.split("://")[1].split(":")[0];
        return host;
    }

    /**
     * Datenbanknamen aus JDBC-URL extrahieren
     */
    private String extractDatabase() {
        // jdbc:postgresql://localhost:5432/nachweise_db
        return datasourceUrl.split("/")[datasourceUrl.split("/").length - 1];
    }
}
