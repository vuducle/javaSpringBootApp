package org.example.springboot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 🔔 Notification Model
 * 
 * Speichert Benachrichtigungen für Benutzer bezüglich Nachweise
 * - Nachweis akzeptiert/abgelehnt
 * - Nachweis-Status Updates
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type; // INFO, SUCCESS, WARNING, ERROR

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status; // UNREAD, READ

    // Verlinke zum Nachweis
    @Column(name = "nachweis_id")
    private UUID nachweisId; // ID des zugehörigen Nachweises

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime readAt;

    @Column
    private String actionUrl; // Ziel-URL wenn User auf Notification klickt

    public enum NotificationType {
        INFO, // Normale Information zu Nachweis
        SUCCESS, // Nachweis akzeptiert
        WARNING, // Warnung zu Nachweis
        ERROR // Fehler bei Nachweis
    }

    public enum NotificationStatus {
        UNREAD,
        READ
    }
}
