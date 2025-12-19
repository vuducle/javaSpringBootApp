package org.example.springboot.monitoring;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * 📊 **Cache Operation Interceptor - AspectJ AOP**
 *
 * Dieser Aspekt intercepted alle @Cacheable/@CachePut/@CacheEvict Operationen
 * und logged/tracked automatisch:
 * - Cache Operation Latenz
 * - Hit/Miss Raten
 * - Fehler-Raten
 *
 * Das passiert völlig automatisch ohne Code-Änderungen in den Services!
 */
@Slf4j
@Component
@Aspect
public class CacheMonitoringAspect {

    private final CacheMonitoring cacheMonitoring;
    private final MeterRegistry meterRegistry;

    @Autowired
    public CacheMonitoringAspect(CacheMonitoring cacheMonitoring, MeterRegistry meterRegistry) {
        this.cacheMonitoring = cacheMonitoring;
        this.meterRegistry = meterRegistry;
    }

    /**
     * Intercepted @Cacheable Methodenaufrufe
     * Misst Latenz und trackt Hit/Miss
     */
    @Around("@annotation(org.springframework.cache.annotation.Cacheable)")
    public Object aroundCacheable(org.aspectj.lang.ProceedingJoinPoint pjp) throws Throwable {
        Timer.Sample sample = Timer.start(meterRegistry);
        String methodName = pjp.getSignature().getName();

        try {
            Object result = pjp.proceed();

            // Hit wenn result nicht null
            if (result != null) {
                cacheMonitoring.recordCacheHit(methodName);
                log.debug("Cache HIT: {}", methodName);
            } else {
                cacheMonitoring.recordCacheMiss(methodName);
                log.debug("Cache MISS: {}", methodName);
            }

            sample.stop(Timer.builder("cache.operation.cacheable")
                    .tag("method", methodName)
                    .tag("type", "hit")
                    .register(meterRegistry));

            return result;
        } catch (Exception e) {
            sample.stop(Timer.builder("cache.operation.cacheable.error")
                    .tag("method", methodName)
                    .register(meterRegistry));

            log.error("Cache Error in {}: {}", methodName, e.getMessage());
            throw e;
        }
    }

    /**
     * Intercepted @CacheEvict Methodenaufrufe
     * Misst Latenz für Cache-Invalidierung
     */
    @Around("@annotation(org.springframework.cache.annotation.CacheEvict)")
    public Object aroundCacheEvict(org.aspectj.lang.ProceedingJoinPoint pjp) throws Throwable {
        Timer.Sample sample = Timer.start(meterRegistry);
        String methodName = pjp.getSignature().getName();

        try {
            Object result = pjp.proceed();

            sample.stop(Timer.builder("cache.operation.evict")
                    .tag("method", methodName)
                    .register(meterRegistry));

            log.debug("Cache EVICT: {}", methodName);
            return result;
        } catch (Exception e) {
            sample.stop(Timer.builder("cache.operation.evict.error")
                    .tag("method", methodName)
                    .register(meterRegistry));

            log.error("Cache Evict Error in {}: {}", methodName, e.getMessage());
            throw e;
        }
    }

    /**
     * Intercepted @CachePut Methodenaufrufe
     * Misst Latenz für Cache-Updates
     */
    @Around("@annotation(org.springframework.cache.annotation.CachePut)")
    public Object aroundCachePut(org.aspectj.lang.ProceedingJoinPoint pjp) throws Throwable {
        Timer.Sample sample = Timer.start(meterRegistry);
        String methodName = pjp.getSignature().getName();

        try {
            Object result = pjp.proceed();

            sample.stop(Timer.builder("cache.operation.put")
                    .tag("method", methodName)
                    .register(meterRegistry));

            log.debug("Cache PUT/UPDATE: {}", methodName);
            return result;
        } catch (Exception e) {
            sample.stop(Timer.builder("cache.operation.put.error")
                    .tag("method", methodName)
                    .register(meterRegistry));

            log.error("Cache Put Error in {}: {}", methodName, e.getMessage());
            throw e;
        }
    }
}
