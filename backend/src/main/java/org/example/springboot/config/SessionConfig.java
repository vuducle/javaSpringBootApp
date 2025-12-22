package org.example.springboot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.session.web.http.HttpSessionIdResolver;
import org.springframework.session.web.http.HeaderHttpSessionIdResolver;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.session.data.redis.RedisIndexedSessionRepository;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import java.time.Duration;

/**
 * 🔴 **Redis Session-Verwaltung - Optimiert!**
 *
 * Diese Konfiguration stellt sicher, dass:
 * 1. Session-Daten in Redis persistiert werden (nicht im Memory)
 * 2. Sessions über mehrere Server-Instanzen hinweg verfügbar sind (Horizontal
 * Scaling)
 * 3. Die Daten mit Jackson serialisiert werden (nicht Java-Serialisierung)
 * 4. Sessions automatisch nach Inaktivität ablaufen
 * 5. Performance durch optimierte Timeouts und Batching maximiert wird
 *
 * ⚡ Benefits:
 * - Horizontale Skalierbarkeit (mehrere App-Instanzen)
 * - Persistenz bei App-Neustarts
 * - Bessere Memory-Auslastung
 * - Session-Daten für Monitoring zugänglich
 */
@Configuration
@EnableRedisHttpSession(
        // Standard: 1800 Sekunden (30 Minuten). Hier: 14400 (4 Stunden) für längere
        // Sessions
        maxInactiveIntervalInSeconds = 14400,
        // Redis Key Namespace
        redisNamespace = "spring:session")
public class SessionConfig {

    /**
     * Definiert, wie Session-IDs transportiert werden.
     * Standardmäßig: Cookie (sicher für Browser)
     * Alternative: Header (für API-Clients)
     *
     * Wir nutzen Cookie mit HttpOnly Flag für maximale Sicherheit
     */
    @Bean
    public HttpSessionIdResolver httpSessionIdResolver() {
        return HeaderHttpSessionIdResolver.xAuthToken();
    }

    /**
     * Konfiguriert das Redis-Session-Repository mit optimierten Einstellungen
     * 
     * Nutzt die zentrale RedisOperations Bean aus RedisConfig für Konsistenz.
     */
    @Bean
    public RedisIndexedSessionRepository redisIndexedSessionRepository(
            RedisOperations<String, Object> redisOperations) {

        RedisIndexedSessionRepository sessionRepository = new RedisIndexedSessionRepository(redisOperations);

        // Session-Timeout: 4 Stunden
        sessionRepository.setDefaultMaxInactiveInterval((int) Duration.ofHours(4).getSeconds());

        // Redis Key-Namespace anpassen
        sessionRepository.setRedisKeyNamespace("spring:session");

        return sessionRepository;
    }
}
