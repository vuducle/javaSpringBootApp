package org.example.springboot.util;

import lombok.extern.slf4j.Slf4j;
import org.example.springboot.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.UUID;

/**
 * 🔐 SecurityUtils
 * 
 * Helper Methoden für Security-Operationen
 * - Aktuelle User ID aus Authentication extrahieren
 * - Authentication Details
 */
@Slf4j
public class SecurityUtils {

    /**
     * Extrahiere User ID aus Authentication
     * Die User Entity wird vom JwtAuthenticationFilter in die Authentication
     * gesteckt
     */
    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("No authenticated user found");
            return null;
        }

        Object principal = authentication.getPrincipal();
        log.debug("Principal type: {}, isUserDetails: {}", principal.getClass().getSimpleName(),
                principal instanceof UserDetails);

        // Principal ist die User Entity (als UserDetails)
        if (principal instanceof User user) {
            return user.getId();
        }

        if (principal instanceof UserDetails userDetails) {
            // Falls es nur UserDetails ist, können wir nicht die ID extrahieren
            log.warn("Principal is UserDetails but not User entity");
            return null;
        }

        log.warn("Could not extract User ID from authentication");
        return null;
    }

    /**
     * Extrahiere Username aus SecurityContext
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }

        return authentication.getName();
    }

    /**
     * Prüfe ob Benutzer authentifiziert ist
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    /**
     * Prüfe ob Benutzer eine bestimmte Role hat
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities()
                .stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + role));
    }
}
