package org.example.springboot.config;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

/**
 * 🌐 **Was geht hier ab?**
 * Diese Klasse regelt allgemeine Web-Einstellungen. In diesem Fall sorgt sie
 * dafür, dass statische
 * Ressourcen, wie z.B. hochgeladene Profilbilder, über eine URL abrufbar sind.
 *
 * Sie mappt den URL-Pfad `/uploads/profile-images/**` auf den lokalen Ordner
 * `uploads/profile-images/`.
 * Heißt: Wenn du `http://localhost:8080/uploads/profile-images/bild.jpg`
 * aufrufst, liefert der Server
 * die entsprechende Bild-Datei aus dem Ordner aus. Das ist wichtig, damit das
 * Frontend die Bilder
 * auch anzeigen kann.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Konfiguriere den Pfad für hochgeladene Profilbilder
        registry.addResourceHandler("/uploads/profile-images/**")
                .addResourceLocations("file:uploads/profile-images/")
                .setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic().immutable())
                .resourceChain(true);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Explizite Origins für Development
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "http://127.0.0.1:*",
                frontendUrl));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
