package org.example.springboot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;

import java.time.Duration;

/**
 * 🚀 **Was geht hier ab?**
 * Hier wird die Connection zu Redis klargemacht. Redis ist 'ne geisteskrank
 * schnelle In-Memory-Datenbank.
 * Wir nutzen die als Cache, um Daten, die oft gebraucht werden,
 * zwischenzuspeichern (z.B. User-Sessions,
 * häufig abgefragte Daten).
 *
 * Statt jedes Mal lahm auf die Haupt-DB zuzugreifen, holt sich die App die
 * Daten blitzschnell aus Redis.
 * Das gibt der App 'nen krassen Performance-Boost und sorgt für 'nen smootheren
 * Vibe.
 * Diese Klasse stellt sicher, dass die App weiß, wo Redis läuft und wie sie
 * damit quatschen soll.
 */
@Configuration
@EnableCaching
@EnableRedisRepositories(basePackages = "org.example.springboot.repository")
public class RedisConfig {

    // Werte aus application.properties injizieren
    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    // 1. Manuelle Konfiguration der Redis Connection Factory
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        // Wir nutzen die Lettuce-Implementierung
        return new LettuceConnectionFactory(redisHost, redisPort);
    }

    // 2. Manuelle Konfiguration des RedisTemplate (wie zuvor, aber mit injizierter
    // ConnectionFactory)
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Konfiguriere ObjectMapper mit JSR310-Support für LocalDateTime und andere
        // Java 8 date/time types
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.registerModule(new Hibernate6Module()); // Handle Hibernate proxies
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);

        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);

        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory,
            RedisCacheConfiguration cacheConfiguration) {
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(cacheConfiguration)
                .build();
    }
}