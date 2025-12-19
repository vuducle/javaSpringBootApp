package org.example.springboot.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import java.time.Duration;

/**
 * 🚀 **Redis Caching Konfiguration - Für Business-Daten!**
 *
 * Diese Konfiguration stellt sicher, dass häufig abgerufene Daten
 * (Benutzer-Profile, Einstellungen, etc.) in Redis gecacht werden.
 *
 * Mit @Cacheable/@CachePut/@CacheEvict Annotations können wir gezielt
 * cachen wo es Sinn macht, ohne den Code zu überlasten.
 *
 * ⚡ Konfiguration:
 * - Default TTL (Time To Live): 10 Minuten für generische Caches
 * - Spezifische Timeouts pro Cache-Namen (z.B. 1h für User-Daten)
 * - JSON-Serialisierung für bessere Debugging-Möglichkeiten
 * - Automatische Serialisierung von komplexen Objekten
 */
@Configuration
@EnableCaching
public class CacheConfig {

        /**
         * Konfiguriert RedisCacheManager mit optimierten Serialisierungs-Einstellungen
         * und TTL-Strategien pro Cache-Name
         */
        @Bean
        public RedisCacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
                // Default-Konfiguration für alle Caches
                RedisCacheConfiguration defaultCacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                                // Standard-TTL: 10 Minuten
                                .entryTtl(Duration.ofMinutes(10))
                                // Null-Werte nicht cachen (spart Speicher)
                                .disableCachingNullValues()
                                // Serialisierung
                                .serializeKeysWith(
                                                RedisSerializationContext.SerializationPair.fromSerializer(
                                                                new StringRedisSerializer()))
                                .serializeValuesWith(
                                                RedisSerializationContext.SerializationPair.fromSerializer(
                                                                new GenericJackson2JsonRedisSerializer()));

                // Cache-spezifische Konfigurationen
                var cacheConfigMap = java.util.Map.of(
                                // User-Daten: 1 Stunde TTL (selten ändernd)
                                "users", defaultCacheConfig.entryTtl(Duration.ofHours(1)),
                                // Benutzer-Profile: 1 Stunde TTL
                                "userProfiles", defaultCacheConfig.entryTtl(Duration.ofHours(1)),
                                // Rate-Limit-Daten: 1 Minute (genau kalibriert)
                                "rateLimits", defaultCacheConfig.entryTtl(Duration.ofMinutes(1)),
                                // Settings/Config: 1 Tag (sehr stabil)
                                "settings", defaultCacheConfig.entryTtl(Duration.ofHours(24)));

                return RedisCacheManager.builder(redisConnectionFactory)
                                .cacheDefaults(defaultCacheConfig)
                                .withInitialCacheConfigurations(cacheConfigMap)
                                .build();
        }

        /**
         * Konfiguriert eine Jackson ObjectMapper für bessere Serialisierung
         * von komplexen Objekten im Cache mit Java 8 date/time support
         */
        @Bean
        public ObjectMapper cacheObjectMapper() {
                ObjectMapper objectMapper = new ObjectMapper();
                // Registriere das JSR310 Module für LocalDateTime Support
                objectMapper.registerModule(new JavaTimeModule());
                // Registriere Hibernate6 Module zur Handling von Proxies
                objectMapper.registerModule(new Hibernate6Module());
                // Schreibe Timestamps als ISO 8601 Strings statt als Zahlen
                objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
                return objectMapper;
        }
}
