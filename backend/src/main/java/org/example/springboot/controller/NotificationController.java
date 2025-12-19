package org.example.springboot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.springboot.model.Notification;
import org.example.springboot.service.NotificationService;
import org.example.springboot.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 🔔 NotificationController
 * 
 * REST Endpoints für Notification Center (Nachweis-fokussiert)
 * - Ungelesene Benachrichtigungen abrufen
 * - Badge-Count
 * - Markiere als gelesen
 * - Lösche Benachrichtigungen
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Benachrichtigungen", description = "🔔 Verwaltung von Benachrichtigungen im Notification Center für Ausbildungsnachweise")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 📋 GET /api/notifications
     * Hole alle ungelesenen Benachrichtigungen (paginiert)
     */
    @Operation(summary = "Ungelesene Benachrichtigungen abrufen", description = "Ruft alle ungelesenen Benachrichtigungen des aktuellen Benutzers ab. Die Ergebnisse sind paginiert.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Benachrichtigungen erfolgreich abgerufen", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "Benutzer nicht authentifiziert")
    })
    @GetMapping
    public ResponseEntity<Page<Notification>> getUnreadNotifications(
            @Parameter(description = "Seitennummer (0-basiert)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Anzahl der Einträge pro Seite", example = "20") @RequestParam(defaultValue = "20") int size) {

        UUID userId = SecurityUtils.getCurrentUserId();
        log.debug("getUnreadNotifications - userId: {}", userId);

        if (userId == null) {
            log.warn("getCurrentUserId returned null - user not authenticated");
            return ResponseEntity.status(401).build();
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationService.getUnreadNotifications(userId, pageable);

        return ResponseEntity.ok(notifications);
    }

    /**
     * 📋 GET /api/notifications/all
     * Hole ALLE Benachrichtigungen (nicht nur ungelesene)
     */
    @Operation(summary = "Alle Benachrichtigungen abrufen", description = "Ruft alle Benachrichtigungen des aktuellen Benutzers ab (gelesen und ungelesen). Die Ergebnisse sind paginiert.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Benachrichtigungen erfolgreich abgerufen", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "Benutzer nicht authentifiziert")
    })
    @GetMapping("/all")
    public ResponseEntity<Page<Notification>> getAllNotifications(
            @Parameter(description = "Seitennummer (0-basiert)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Anzahl der Einträge pro Seite", example = "20") @RequestParam(defaultValue = "20") int size) {

        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationService.getAllNotifications(userId, pageable);

        return ResponseEntity.ok(notifications);
    }

    /**
     * 📊 GET /api/notifications/count
     * Zähle ungelesene Benachrichtigungen (für Badge in UI)
     */
    @Operation(summary = "Anzahl ungelesener Benachrichtigungen", description = "Ruft die Anzahl der ungelesenen Benachrichtigungen des aktuellen Benutzers ab. Dies wird für das Badge-Icon in der Navigation verwendet.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Zählung erfolgreich abgerufen", content = @Content(mediaType = "application/json", schema = @Schema(type = "object", example = "{\"unreadCount\": 3, \"hasUnread\": true}"))),
            @ApiResponse(responseCode = "401", description = "Benutzer nicht authentifiziert")
    })
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        long unreadCount = notificationService.getUnreadCount(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("unreadCount", unreadCount);
        response.put("hasUnread", unreadCount > 0);

        return ResponseEntity.ok(response);
    }

    /**
     * ✅ PUT /api/notifications/{id}/read
     * Markiere einzelne Benachrichtigung als gelesen
     */
    @Operation(summary = "Benachrichtigung als gelesen markieren", description = "Markiert eine einzelne Benachrichtigung als gelesen und aktualisiert den readAt-Zeitstempel.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Benachrichtigung erfolgreich als gelesen markiert", content = @Content(mediaType = "application/json", schema = @Schema(type = "object", example = "{\"message\": \"Notification marked as read\", \"id\": \"123e4567-e89b-12d3-a456-426614174000\"}"))),
            @ApiResponse(responseCode = "401", description = "Benutzer nicht authentifiziert"),
            @ApiResponse(responseCode = "404", description = "Benachrichtigung nicht gefunden")
    })
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @Parameter(description = "Die eindeutige ID der Benachrichtigung") @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        notificationService.markAsRead(id, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification marked as read");
        response.put("id", id.toString());

        return ResponseEntity.ok(response);
    }

    /**
     * ✅ PUT /api/notifications/read-all
     * Markiere ALLE Benachrichtigungen als gelesen
     */
    @Operation(summary = "Alle Benachrichtigungen als gelesen markieren", description = "Markiert alle Benachrichtigungen des aktuellen Benutzers als gelesen.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Alle Benachrichtigungen erfolgreich als gelesen markiert", content = @Content(mediaType = "application/json", schema = @Schema(type = "object", example = "{\"message\": \"All notifications marked as read\"}"))),
            @ApiResponse(responseCode = "401", description = "Benutzer nicht authentifiziert")
    })
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        notificationService.markAllAsRead(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");

        return ResponseEntity.ok(response);
    }

    /**
     * 🗑️ DELETE /api/notifications/{id}
     * Lösche Benachrichtigung
     */
    @Operation(summary = "Benachrichtigung löschen", description = "Löscht eine einzelne Benachrichtigung des aktuellen Benutzers.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Benachrichtigung erfolgreich gelöscht", content = @Content(mediaType = "application/json", schema = @Schema(type = "object", example = "{\"message\": \"Notification deleted\", \"id\": \"123e4567-e89b-12d3-a456-426614174000\"}"))),
            @ApiResponse(responseCode = "401", description = "Benutzer nicht authentifiziert"),
            @ApiResponse(responseCode = "404", description = "Benachrichtigung nicht gefunden")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @Parameter(description = "Die eindeutige ID der Benachrichtigung") @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        notificationService.deleteNotification(id, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted");
        response.put("id", id.toString());

        return ResponseEntity.ok(response);
    }

    /**
     * 🗑️ DELETE /api/notifications
     * Lösche ALLE ungelesenen Benachrichtigungen (optional)
     */
    @Operation(summary = "Alle Benachrichtigungen löschen", description = "Löscht oder leert alle Benachrichtigungen des aktuellen Benutzers (markiert sie als gelesen).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Alle Benachrichtigungen erfolgreich gelöscht", content = @Content(mediaType = "application/json", schema = @Schema(type = "object", example = "{\"message\": \"All notifications cleared\"}"))),
            @ApiResponse(responseCode = "401", description = "Benutzer nicht authentifiziert")
    })
    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteAllNotifications() {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        // Markiere alle als gelesen statt sie zu löschen
        notificationService.markAllAsRead(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications cleared");

        return ResponseEntity.ok(response);
    }

    /**
     * 🧹 DELETE /api/notifications/cleanup
     * Admin-only: Lösche alte Benachrichtigungen (älter als 30 Tage)
     */
    @Operation(summary = "Alte Benachrichtigungen löschen (Admin)", description = "Löscht alle Benachrichtigungen, die älter als die angegebene Anzahl von Tagen sind. Nur für Administratoren verfügbar.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bereinigung erfolgreich abgeschlossen", content = @Content(mediaType = "application/json", schema = @Schema(type = "object", example = "{\"message\": \"Cleanup completed for notifications older than 30 days\"}"))),
            @ApiResponse(responseCode = "401", description = "Benutzer nicht authentifiziert"),
            @ApiResponse(responseCode = "403", description = "Nur Administratoren haben Zugriff")
    })
    @DeleteMapping("/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> cleanupOldNotifications(
            @Parameter(description = "Anzahl der Tage zu speichern (Standard: 30)", example = "30") @RequestParam(defaultValue = "30") int daysToKeep) {

        notificationService.deleteOldNotifications(daysToKeep);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Cleanup completed for notifications older than " + daysToKeep + " days");

        return ResponseEntity.ok(response);
    }
}
