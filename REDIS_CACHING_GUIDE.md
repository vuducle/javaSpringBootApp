# 🚀 Redis Caching & Session Optimierung - Implementierungsleitfaden

## 📋 Überblick

Diese Optimierung verbessert die Performance durch:

- **Session-Verwaltung in Redis** (statt In-Memory oder DB)
- **Application-Level Caching** für häufig abgerufene Daten
- **Horizontale Skalierbarkeit** über mehrere Server-Instanzen
- **Monitoring & Metriken** für Cache-Effizienz

---

## 🔧 Implementierte Komponenten

### 1. **SessionConfig.java**

```
📍 Location: backend/src/main/java/org/example/springboot/config/SessionConfig.java
```

**Features:**

- ✅ Spring Session mit Redis (`@EnableRedisHttpSession`)
- ✅ Session TTL: 4 Stunden (konfigurierbar)
- ✅ Jackson JSON-Serialisierung (bessere Performance als Java-Serialisierung)
- ✅ Polymorphe Type-Handling für sichere Deserialisierung
- ✅ Header-basierte Session-ID (`X-Auth-Token`)

**Konfiguration:**

```java
@EnableRedisHttpSession(
    maxInactiveIntervalInSeconds = 14400,  // 4 Stunden
    redisNamespace = "spring:session"
)
```

---

### 2. **CacheConfig.java**

```
📍 Location: backend/src/main/java/org/example/springboot/config/CacheConfig.java
```

**Features:**

- ✅ RedisCacheManager für Application-Level Caching
- ✅ Unterschiedliche TTLs pro Cache-Name
- ✅ Null-Value Caching deaktiviert (spart Memory)
- ✅ JSON-Serialisierung für Debuggability

**Vordefinierte Caches:**
| Cache Name | TTL | Use Case |
|-----------|-----|----------|
| `users` | 1 Stunde | User-Daten (Profil, Settings) |
| `userProfiles` | 1 Stunde | User Profile-Objekte |
| `rateLimits` | 1 Minute | Rate-Limit Zähler |
| `settings` | 24 Stunden | Globale App-Konfiguration |

---

### 3. **CacheMonitoring.java**

```
📍 Location: backend/src/main/java/org/example/springboot/monitoring/CacheMonitoring.java
```

**Gemessene Metriken:**

- 📊 Session Hits/Misses
- 📊 Cache Hits/Misses (pro Cache-Name)
- 📊 Cache Hit-Rate (%)
- 📊 Redis Memory-Nutzung
- 📊 Redis Key-Count

**Integration mit Micrometer:**

```bash
# Alle Metriken abrufbar über:
curl http://localhost:8088/actuator/metrics
```

---

### 4. **MonitoringController.java**

```
📍 Location: backend/src/main/java/org/example/springboot/controller/MonitoringController.java
```

**REST-Endpoints:**

#### `GET /api/monitoring/cache/stats`

Gibt Cache-Statistiken zurück:

```json
{
  "sessionHits": 1250,
  "sessionMisses": 45,
  "cacheHits": 8930,
  "cacheMisses": 320,
  "hitRate": "96.53%",
  "sessionHitRate": "96.54%",
  "appCacheHitRate": "96.52%",
  "totalRequests": 9545
}
```

#### `GET /api/monitoring/redis/info`

Redis-Serverinformationen:

```json
{
  "totalKeys": 2341,
  "sessionKeys": 450,
  "rateLimitKeys": 120,
  "status": "Connected"
}
```

#### `POST /api/monitoring/cache/flush`

Löscht alle Application-Caches (Admin-only):

```json
{
  "status": "success",
  "message": "Application caches flushed successfully"
}
```

---

### 5. **UserService Caching**

```
📍 Location: backend/src/main/java/org/example/springboot/service/auth/UserService.java
```

**Cacheable Methoden:**

```java
@Cacheable(value = "users", key = "#username")
public User findByUsername(String username) { ... }

@Cacheable(value = "users", key = "#username")
public UserDetails loadUserByUsername(String username) { ... }
```

**Cache-Eviction (bei Änderungen):**

```java
@CacheEvict(value = "users", key = "#username")
public void changePassword(String username, ...) { ... }

@CacheEvict(value = "users", key = "#username")
public void updateUserProfile(String username, ...) { ... }
```

---

## 🔧 application.properties Konfiguration

```properties
# Redis Verbindung
spring.data.redis.host=${REDIS_HOST:localhost}
spring.data.redis.port=${REDIS_PORT:6379}

# Verbindungs-Pool
spring.redis.jedis.pool.max-active=20
spring.redis.jedis.pool.max-idle=10
spring.redis.jedis.pool.min-idle=5

# Session Store
spring.session.store-type=redis
spring.session.timeout=14400s                    # 4 Stunden
spring.session.redis.namespace=spring:session
spring.session.redis.flush-mode=immediate        # Sofort persistieren

# Caching
spring.cache.type=redis
spring.cache.redis.time-to-live=600000          # 10 Minuten (default)
```

---

## 📊 Performance-Metriken & Monitoring

### Zugang zu Metrics:

```bash
# Alle verfügbaren Metriken
curl http://localhost:8088/actuator/metrics

# Spezifische Metrik
curl http://localhost:8088/actuator/metrics/cache.hit.rate

# Cache-Hit-Statistiken
curl http://localhost:8088/api/monitoring/cache/stats

# Redis Status
curl http://localhost:8088/api/monitoring/redis/info
```

### Prometheus Integration (Optional):

```bash
# Metriken für Prometheus
curl http://localhost:8088/actuator/prometheus
```

---

## ⚡ Optimierungspotenziale (Nächste Schritte)

### 1. **Weitere Caches hinzufügen**

```java
// In Service-Methoden:
@Cacheable(value = "nachweise", key = "#nachweisId")
public Nachweis getNachweisById(UUID nachweisId) { ... }

@CacheEvict(value = "nachweise", key = "#nachweis.id")
public void saveNachweis(Nachweis nachweis) { ... }
```

### 2. **Cache Warming (Proaktives Laden)**

```java
@Component
public class CacheWarmer {
    @PostConstruct
    public void warmCaches() {
        // Wichtige Daten beim Start in Cache laden
        userService.findByUsername("admin@example.com");
    }
}
```

### 3. **Conditional Caching**

```java
@Cacheable(value = "users", key = "#username",
           condition = "#username != null && #username.length() > 0",
           unless = "#result == null")
public User findByUsername(String username) { ... }
```

### 4. **Custom Cache-Keys für komplexe Szenarios**

```java
@Cacheable(value = "usersByRole",
           key = "T(java.util.Objects).hash(#role, #department)")
public List<User> findByRoleAndDepartment(Role role, String department) { ... }
```

---

## 🐛 Troubleshooting

### Cache funktioniert nicht?

```bash
# 1. Redis Verbindung prüfen
redis-cli ping
# Output: PONG

# 2. Redis Keys prüfen
redis-cli KEYS "*"

# 3. Logs prüfen
tail -f backend/logs/application.log | grep -i "cache\|redis"
```

### Session funktioniert nicht?

```bash
# Redis Session Keys prüfen
redis-cli KEYS "spring:session:*"

# Session-Inhalt anzeigen
redis-cli GET "spring:session:sessions:abc123xyz"
```

### Memory-Probleme?

```bash
# Redis Memory Info
redis-cli INFO memory

# Eviction Policy prüfen
redis-cli CONFIG GET maxmemory-policy
```

---

## 📈 Best Practices

### ✅ Zu beachtende Punkte:

1. **TTL richtig setzen**

   - Häufig ändernde Daten: 1-5 Minuten
   - Stabile Daten: 1-24 Stunden
   - Sessions: 2-4 Stunden

2. **Cache-Keys konsistent halten**

   - Verwende `key = "#paramName"`
   - Vermeide zu lange Keys

3. **Cache evicten beim Update**

   - `@CacheEvict` bei jedem Schreibzugriff
   - `@CachePut` zum Update mit Re-Caching

4. **Null-Values handhaben**

   - `disableCachingNullValues()` deaktiviert Null-Caching
   - Spart Redis-Memory

5. **Monitoring nutzen**
   - Regelmäßig Hit-Rates prüfen
   - Cache-Größe monitoren
   - Anomalien investigieren

---

## 🔐 Sicherheitsaspekte

### Session Security:

```properties
# HttpOnly Flag
spring.session.servlet.cookie.http-only=true

# Same-Site Policy
spring.session.servlet.cookie.same-site=strict

# Secure Flag (für HTTPS)
server.servlet.session.cookie.secure=true
```

### Redis Security:

```bash
# Redis mit Passwort schützen (docker-compose.yml)
command: redis-server --requirepass ${REDIS_PASSWORD}

# Verbindung verschlüsseln (optional)
spring.redis.ssl=true
```

---

## 📚 Nützliche Links

- [Spring Session Documentation](https://spring.io/projects/spring-session)
- [Spring Cache Documentation](https://spring.io/guides/gs/caching/)
- [Redis Best Practices](https://redis.io/topics/data-types-intro)
- [Micrometer Metrics](https://micrometer.io/)

---

**Version:** 1.0 | **Last Updated:** Dezember 2025
