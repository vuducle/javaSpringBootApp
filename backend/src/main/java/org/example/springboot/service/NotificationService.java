package org.example.springboot.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.springboot.model.Notification;
import org.example.springboot.model.User;
import org.example.springboot.repository.NotificationRepository;
import org.example.springboot.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Optional;

/**
 * 🔔 NotificationService
 * 
 * Business Logic für Benachrichtigungsverwaltung (Nachweis-fokussiert)
 * - Neue Benachrichtigungen für Nachweise erstellen
 * - Benachrichtigungen abrufen (paginiert)
 * - Status updaten
 * - Cleanup alter Benachrichtigungen
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * 📨 Neue Benachrichtigung für Nachweis erstellen und speichern
     */
    public Notification createNotification(UUID userId, String title, String message,
            Notification.NotificationType type,
            UUID nachweisId, String actionUrl) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.warn("User {} nicht gefunden für Notification", userId);
            return null;
        }

        Notification notification = new Notification();
        notification.setRecipient(userOpt.get());
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setStatus(Notification.NotificationStatus.UNREAD);
        notification.setNachweisId(nachweisId);
        notification.setActionUrl(actionUrl);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);
        log.info("✅ Notification erstellt für User {}: {}", userId, title);
        return saved;
    }

    /**
     * 🔔 Schnelle Notification-Erstellung mit Defaults
     */
    public Notification createSimpleNotification(UUID userId, String title, String message,
            Notification.NotificationType type) {
        return createNotification(userId, title, message, type, null, null);
    }

    /**
     * 📋 Alle ungelesenen Benachrichtigungen abrufen (paginiert)
     */
    @Transactional(readOnly = true)
    public Page<Notification> getUnreadNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findUnreadByUserId(userId, pageable);
    }

    /**
     * 📋 Alle Benachrichtigungen abrufen (paginiert)
     */
    @Transactional(readOnly = true)
    public Page<Notification> getAllNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable);
    }

    /**
     * 📊 Zähle ungelesene Benachrichtigungen
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    /**
     * ✅ Markiere Benachrichtigung als gelesen
     */
    public void markAsRead(UUID notificationId, UUID userId) {
        notificationRepository.markAsRead(notificationId, userId);
        log.debug("Notification {} als gelesen markiert", notificationId);
    }

    /**
     * ✅ Markiere alle Benachrichtigungen als gelesen
     */
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
        log.info("Alle Notifications für User {} als gelesen markiert", userId);
    }

    /**
     * 🗑️ Lösche Benachrichtigung
     */
    public void deleteNotification(UUID notificationId, UUID userId) {
        // Sicherheits-Check: Benutzer kann nur seine eigenen Benachrichtigungen löschen
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isPresent() && notification.get().getRecipient().getId().equals(userId)) {
            notificationRepository.delete(notification.get());
            log.info("Notification {} gelöscht", notificationId);
        } else {
            log.warn("Unauthorized delete attempt für Notification {}", notificationId);
        }
    }

    /**
     * 🧹 Cleanup: Lösche Benachrichtigungen älter als X Tage
     * Sollte als Scheduled Task aufgerufen werden
     */
    public void deleteOldNotifications(int daysToKeep) {
        LocalDateTime beforeDate = LocalDateTime.now().minusDays(daysToKeep);
        notificationRepository.deleteOlderThan(beforeDate);
        log.info("✅ Alte Benachrichtigungen (vor {}) gelöscht", beforeDate);
    }

    /**
     * 🎯 Finde Benachrichtigungen nach Nachweis ID
     */
    @Transactional(readOnly = true)
    public java.util.List<Notification> getNotificationsByNachweisId(UUID nachweisId) {
        return notificationRepository.findByNachweisId(nachweisId);
    }
}
