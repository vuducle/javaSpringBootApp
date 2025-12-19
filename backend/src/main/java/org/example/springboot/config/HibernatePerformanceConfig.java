package org.example.springboot.config;
import org.hibernate.cfg.AvailableSettings;
import org.springframework.context.annotation.Configuration;


import java.util.HashMap;
import java.util.Map;

/**
 * 🚀 Hibernate Performance Optimierungen
 * 
 * Konfiguriert Hibernate für optimale Query-Performance:
 * - Query Result Caching
 * - Lazy Loading Optimierungen
 * - Second-level Cache
 * - v.1.2.0
 */
@Configuration
public class HibernatePerformanceConfig {
    
    /**
     * Hibernate Properties für Performance Tuning
     * 
     * Wichtige Einstellungen:
     * - hibernate.jdbc.fetch_size: Batch Size für DB Queries
     * - hibernate.jdbc.batch_size: Batch Size für Inserts/Updates
     * - hibernate.cache.use_second_level_cache: Aktiviere 2nd Level Cache
     * - hibernate.cache.region.factory_class: Cache Provider (Redis via Spring)
     * - hibernate.generate_statistics: Zeige Query Stats (nur für Debugging)
     */
    public static Map<String, Object> hibernateProperties() {
        Map<String, Object> properties = new HashMap<>();
        
        // 🔄 Batch Processing für bessere Performance
        properties.put(AvailableSettings.STATEMENT_FETCH_SIZE, 50); // Fetch 50 rows pro Query
        properties.put(AvailableSettings.STATEMENT_BATCH_SIZE, 20); // Batch 20 inserts zusammen
        properties.put(AvailableSettings.BATCH_VERSIONED_DATA, true); // Batch versioned data
        
        // 💾 Second-Level Cache (via Redis durch Spring Data Redis)
        properties.put(AvailableSettings.USE_SECOND_LEVEL_CACHE, false); // Spring Cache reicht
        properties.put(AvailableSettings.USE_QUERY_CACHE, false); // Query Cache via Spring Cache
        
        // 🎯 Lazy Loading Optimierungen
        properties.put("hibernate.enable_lazy_load_no_trans", true); // Lazy Load ohne TX
        // properties.put(AvailableSettings.USE_REFLECTION_OPTIMIZER, true); // Removed - not available in Hibernate 6.x
        
        // 📊 Statistics (nur für Development!)
        // properties.put(AvailableSettings.GENERATE_STATISTICS, true);
        // properties.put("hibernate.session.events.log", true);
        
        // 🔍 Query Optimierungen
        properties.put("hibernate.query.in_clause_parameter_padding", true); // Optimize IN clauses
        
        return properties;
    }
}
