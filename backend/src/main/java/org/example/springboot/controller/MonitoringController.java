package org.example.springboot.controller;

import org.example.springboot.monitoring.CacheMonitoring;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.HashMap;
import java.util.Map;

/**
 * 📊 Cache & Session Monitoring REST API
 *
 * Endpoints:
 * - GET /api/monitoring/cache/stats - Cache-Statistiken
 * - GET /api/monitoring/redis/info - Redis Info
 * - POST /api/monitoring/cache/flush - Cache löschen (Admin only)
 */
@RestController
@RequestMapping("/api/monitoring")
@Tag(name = "Monitoring", description = "Cache & Session Monitoring")
@SecurityRequirement(name = "Bearer Authentication")
public class MonitoringController {

    private final CacheMonitoring cacheMonitoring;
    private final StringRedisTemplate redisTemplate;

    @Autowired
    public MonitoringController(CacheMonitoring cacheMonitoring,
            StringRedisTemplate redisTemplate) {
        this.cacheMonitoring = cacheMonitoring;
        this.redisTemplate = redisTemplate;
    }

    /**
     * 📈 Gibt aktuelle Cache-Statistiken zurück
     */
    @GetMapping("/cache/stats")
    @Operation(summary = "Get cache statistics", description = "Returns cache hit/miss ratios and performance metrics")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        var stats = cacheMonitoring.getStats();

        Map<String, Object> response = new HashMap<>();
        response.put("sessionHits", stats.sessionHits());
        response.put("sessionMisses", stats.sessionMisses());
        response.put("cacheHits", stats.cacheHits());
        response.put("cacheMisses", stats.cacheMisses());
        response.put("hitRate", String.format("%.2f%%", stats.hitRate()));
        response.put("totalRequests", stats.totalRequests());

        // Berechne Session Hit Rate
        long sessionTotal = stats.sessionHits() + stats.sessionMisses();
        double sessionHitRate = sessionTotal > 0
                ? (double) stats.sessionHits() / sessionTotal * 100
                : 0;
        response.put("sessionHitRate", String.format("%.2f%%", sessionHitRate));

        // Berechne App Cache Hit Rate
        long cacheTotal = stats.cacheHits() + stats.cacheMisses();
        double appCacheHitRate = cacheTotal > 0
                ? (double) stats.cacheHits() / cacheTotal * 100
                : 0;
        response.put("appCacheHitRate", String.format("%.2f%%", appCacheHitRate));

        return ResponseEntity.ok(response);
    }

    /**
     * 🔴 Redis Informationen und Metriken
     */
    @GetMapping("/redis/info")
    @Operation(summary = "Get Redis information", description = "Returns Redis server info, memory usage, and connection stats")
    public ResponseEntity<Map<String, Object>> getRedisInfo() {
        Map<String, Object> info = new HashMap<>();

        try {
            // DB Size - count all keys
            var allKeys = redisTemplate.keys("*");
            Long dbSize = allKeys != null ? (long) allKeys.size() : 0L;
            info.put("totalKeys", dbSize);

            // Session Keys Count - using keys pattern instead
            var sessionKeysSet = redisTemplate.keys("spring:session:*");
            info.put("sessionKeys", sessionKeysSet != null ? sessionKeysSet.size() : 0);

            // Rate Limit Keys - using keys pattern instead
            var rateLimitKeysSet = redisTemplate.keys("rate:*");
            info.put("rateLimitKeys", rateLimitKeysSet != null ? rateLimitKeysSet.size() : 0);

            // Connection Info
            info.put("redisHost", redisTemplate.getConnectionFactory().toString());
            info.put("status", "Connected");

        } catch (Exception e) {
            info.put("status", "Error: " + e.getMessage());
        }

        return ResponseEntity.ok(info);
    }

    /**
     * 🗑️ Cache manuell löschen (Admin-only)
     */
    @PostMapping("/cache/flush")
    @Operation(summary = "Flush all caches", description = "Clears all application caches from Redis (admin only)")
    public ResponseEntity<Map<String, String>> flushCaches() {
        try {
            // Lösche app-spezifische Caches (nicht Sessions/Rate-Limits)
            String[] cachePatterns = {
                    "users:*",
                    "userProfiles:*",
                    "settings:*"
            };

            for (String pattern : cachePatterns) {
                var keysToDelete = redisTemplate.keys(pattern);
                if (keysToDelete != null && !keysToDelete.isEmpty()) {
                    redisTemplate.delete(keysToDelete);
                }
            }

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Application caches flushed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "status", "error",
                    "message", e.getMessage()));
        }
    }
}
