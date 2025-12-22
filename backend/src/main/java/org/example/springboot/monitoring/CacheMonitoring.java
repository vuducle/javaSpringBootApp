package org.example.springboot.monitoring;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 📊 **Redis & Cache Monitoring**
 *
 * Tracked Metriken:
 * - Session-Hits vs. Misses
 * - Cache-Hit-Rate pro Cache-Name
 * - Redis Memory-Nutzung
 * - Request-Latenz für gecachte vs. non-gecachte Daten
 *
 * Diese Metriken sind über `/actuator/metrics` verfügbar
 * und werden von Prometheus/Grafana abgerufen.
 */
@Component
public class CacheMonitoring {

    private final MeterRegistry meterRegistry;
    private final StringRedisTemplate redisTemplate;

    // Counters für Track
    private final AtomicLong sessionHits = new AtomicLong(0);
    private final AtomicLong sessionMisses = new AtomicLong(0);
    private final AtomicLong cacheHits = new AtomicLong(0);
    private final AtomicLong cacheMisses = new AtomicLong(0);

    @Autowired
    public CacheMonitoring(MeterRegistry meterRegistry,
            StringRedisTemplate redisTemplate) {
        this.meterRegistry = meterRegistry;
        this.redisTemplate = redisTemplate;
        initializeMetrics();
    }

    /**
     * Registriert alle Metriken bei Micrometer
     */
    private void initializeMetrics() {
        // Session-Metriken
        meterRegistry.gauge("cache.sessions.hits", sessionHits);
        meterRegistry.gauge("cache.sessions.misses", sessionMisses);

        // Cache-Metriken
        meterRegistry.gauge("cache.application.hits", cacheHits);
        meterRegistry.gauge("cache.application.misses", cacheMisses);

        // Hit-Rate Gauge
        meterRegistry.gauge("cache.hit.rate", this, obj -> {
            long totalHits = sessionHits.get() + cacheHits.get();
            long totalRequests = totalHits + sessionMisses.get() + cacheMisses.get();
            return totalRequests > 0 ? (double) totalHits / totalRequests * 100 : 0;
        });

        // Redis Memory Gauge
        meterRegistry.gauge("redis.memory.bytes", this, obj -> {
            try {
                String info = redisTemplate.getConnectionFactory()
                        .getConnection()
                        .info("memory")
                        .toString();
                // Parse used_memory aus Redis INFO command
                String[] lines = info.split("\n");
                for (String line : lines) {
                    if (line.startsWith("used_memory:")) {
                        return Long.parseLong(line.substring("used_memory:".length()));
                    }
                }
            } catch (Exception e) {
                // Falls Fehler, return -1
            }
            return -1L;
        });

        // Redis Key-Count
        meterRegistry.gauge("redis.keys.count", this, obj -> {
            try {
                var allKeys = redisTemplate.keys("*");
                return allKeys != null ? (long) allKeys.size() : 0;
            } catch (Exception e) {
                return 0;
            }
        });
    }

    /**
     * Wird aufgerufen wenn ein Session-Hit erfolgt
     */
    public void recordSessionHit() {
        sessionHits.incrementAndGet();
    }

    /**
     * Wird aufgerufen wenn ein Session-Miss erfolgt
     */
    public void recordSessionMiss() {
        sessionMisses.incrementAndGet();
    }

    /**
     * Wird aufgerufen wenn ein Cache-Hit erfolgt
     */
    public void recordCacheHit(String cacheName) {
        cacheHits.incrementAndGet();
        meterRegistry.counter("cache.hit", "name", cacheName).increment();
    }

    /**
     * Wird aufgerufen wenn ein Cache-Miss erfolgt
     */
    public void recordCacheMiss(String cacheName) {
        cacheMisses.incrementAndGet();
        meterRegistry.counter("cache.miss", "name", cacheName).increment();
    }

    /**
     * Misst die Ausführungszeit einer Operation
     */
    public <T> T recordCacheOperation(String cacheName, String operation,
            CacheOperationSupplier<T> supplier) throws Exception {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            T result = supplier.get();
            sample.stop(Timer.builder("cache.operation")
                    .tag("cache", cacheName)
                    .tag("operation", operation)
                    .register(meterRegistry));
            return result;
        } catch (Exception e) {
            sample.stop(Timer.builder("cache.operation.error")
                    .tag("cache", cacheName)
                    .tag("operation", operation)
                    .register(meterRegistry));
            throw e;
        }
    }

    /**
     * Interface für Supplier mit Exception
     */
    @FunctionalInterface
    public interface CacheOperationSupplier<T> {
        T get() throws Exception;
    }

    /**
     * Gibt eine Zusammenfassung der Cache-Statistiken zurück
     */
    public CacheStats getStats() {
        long totalHits = sessionHits.get() + cacheHits.get();
        long totalRequests = totalHits + sessionMisses.get() + cacheMisses.get();
        double hitRate = totalRequests > 0 ? (double) totalHits / totalRequests * 100 : 0;

        return new CacheStats(
                sessionHits.get(),
                sessionMisses.get(),
                cacheHits.get(),
                cacheMisses.get(),
                hitRate,
                totalRequests);
    }

    /**
     * DTO für Cache-Statistiken
     */
    public record CacheStats(
            long sessionHits,
            long sessionMisses,
            long cacheHits,
            long cacheMisses,
            double hitRate,
            long totalRequests) {
    }
}
