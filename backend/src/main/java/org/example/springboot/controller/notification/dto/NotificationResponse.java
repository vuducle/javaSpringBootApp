package org.example.springboot.controller.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.springboot.model.Notification;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 🔔 NotificationResponse DTO
 * 
 * Für API Responses mit allen relevanten Daten
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private String title;
    private String message;
    private String type; // INFO, SUCCESS, WARNING, ERROR
    private String status; // UNREAD, READ
    private UUID nachweisId;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String actionUrl;

    /**
     * Konvertiere Entity zu DTO
     */
    public static NotificationResponse fromEntity(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType().toString(),
                notification.getStatus().toString(),
                notification.getNachweisId(),
                notification.getCreatedAt(),
                notification.getReadAt(),
                notification.getActionUrl());
    }
}
