package org.example.springboot.repository;

import org.example.springboot.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 🔔 NotificationRepository
 * 
 * Queries für Notification Management (Nachweis-fokussiert)
 * - Ungelesene Benachrichtigungen abrufen
 * - Benachrichtigungen markieren als gelesen
 * - Alte Benachrichtigungen löschen
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    /**
     * Alle ungelesenen Benachrichtigungen für einen Benutzer (paginiert)
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.id = :userId AND n.status = 'UNREAD' " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findUnreadByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Alle Benachrichtigungen für einen Benutzer (mit Pagination)
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.id = :userId " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Zähle ungelesene Benachrichtigungen
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.recipient.id = :userId AND n.status = 'UNREAD'")
    long countUnreadByUserId(@Param("userId") UUID userId);

    /**
     * Markiere alle Benachrichtigungen als gelesen
     */
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.readAt = CURRENT_TIMESTAMP " +
            "WHERE n.recipient.id = :userId AND n.status = 'UNREAD'")
    void markAllAsRead(@Param("userId") UUID userId);

    /**
     * Markiere spezifische Benachrichtigung als gelesen
     */
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.readAt = CURRENT_TIMESTAMP " +
            "WHERE n.id = :id AND n.recipient.id = :userId")
    void markAsRead(@Param("id") UUID id, @Param("userId") UUID userId);

    /**
     * Lösche alte Benachrichtigungen (älter als X Tage)
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :beforeDate")
    void deleteOlderThan(@Param("beforeDate") LocalDateTime beforeDate);

    /**
     * Finde Benachrichtigungen nach Nachweis ID
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.nachweisId = :nachweisId " +
            "ORDER BY n.createdAt DESC")
    java.util.List<Notification> findByNachweisId(@Param("nachweisId") java.util.UUID nachweisId);
}
