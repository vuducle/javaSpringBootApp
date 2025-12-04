package org.example.javamusicapp.controller.userController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.javamusicapp.controller.userController.dto.ChangePasswordRequest;
import org.example.javamusicapp.controller.userController.dto.UserResponse;
import org.example.javamusicapp.controller.userController.dto.UserUpdateRequest;
import org.example.javamusicapp.model.User;
import org.example.javamusicapp.service.auth.UserService;
import org.example.javamusicapp.service.nachweis.NachweisSecurityService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 👤 **Was geht hier ab?**
 * Dieser Controller ist der Place-to-be für alles, was das eigene User-Profil
 * betrifft.
 * Hier kann man sein Profil pimpen, das Passwort ändern und so weiter.
 * Außerdem gibt's hier krasse Admin-Actions, um andere User zu verwalten.
 *
 * Für normale User:
 * - /profile**: Holt dein aktuelles User-Profil mit allen Infos.
 * - /profile (PUT)**: Updated deine Profil-Infos (Name, E-Mail etc.).
 * - /change-password**: Hier kannst du dein altes Passwort gegen ein neues,
 * freshes tauschen.
 * - /profile-image**: Lade ein Profilbild hoch oder lösche es. Zeig dich von
 * deiner besten Seite!
 *
 * Für Admins/Ausbilder (High-Level-Stuff):
 * - /admins**: Listet alle User auf, die Admin-Rechte haben.
 * - /{username}/grant-admin**: Einem User Admin-Rechte geben. With great power
 * comes great responsibility.
 * - /{username}/revoke-admin**: Einem User die Admin-Rechte wieder wegnehmen.
 * - /{username} (DELETE)**: Löscht einen kompletten User-Account. Use with
 * caution!
 */
@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "User", description = "User-Profil-Verwaltung")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;
    private final NachweisSecurityService nachweisSecurityService;

    /**
     * Ändert das Passwort des aktuell angemeldeten Users.
     * 
     * @param request        Die alten und neuen Passwortinformationen.
     * @param authentication Die Authentifizierungsinformationen des aktuell
     *                       angemeldeten Benutzers.
     * @return Eine ResponseEntity mit dem Ergebnis der Passwortänderung.
     */
    @Operation(summary = "Passwort ändern", description = "Ändert das Passwort des aktuell angemeldeten Users")
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            userService.changePassword(username, request.getOldPassword(), request.getNewPassword());
            log.info("Passwort erfolgreich geändert für User: {}", username);
            return ResponseEntity.ok("Passwort erfolgreich geändert");
        } catch (IllegalArgumentException e) {
            log.warn("Passwortänderung fehlgeschlagen: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Gibt alle aktuellen Admin-User zurück.
     * 
     * @param authentication Die Authentifizierungsinformationen des aktuell
     *                       angemeldeten Benutzers.
     * @return Eine ResponseEntity mit der Liste der Admin-User.
     */
    @Operation(summary = "Admin-Liste", description = "Gibt alle aktuellen Admin-User zurück")
    @GetMapping("/admins")
    @PreAuthorize("hasRole('ADMIN') or @nachweisSecurityService.isAusbilder(authentication)")
    public ResponseEntity<List<UserResponse>> listAdmins(Authentication authentication) {
        List<User> admins = userService.listAdmins();
        List<UserResponse> resp = admins.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(resp);
    }

    /**
     * Gibt alle User zurück, die Nachweise als Ausbilder haben können. (für
     * Ausbilder-Auswahl beim PDF-Erstellen)
     * 
     * @param authentication Die Authentifizierungsinformationen des aktuell
     *                       angemeldeten Benutzers.
     * @return Eine ResponseEntity mit der Liste der Ausbilder-User.
     */
    @Operation(summary = "Ausbilder-Liste", description = "Gibt alle User zurück, die Nachweise als Ausbilder haben können (für Ausbilder-Auswahl beim PDF-Erstellen)")
    @GetMapping("/ausbilder")
    public ResponseEntity<List<UserResponse>> listAusbilder(Authentication authentication) {
        List<User> ausbilder = userService.listAusbilder();
        List<UserResponse> resp = ausbilder.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(resp);
    }



    /**
     * Lädt ein Profilbild für den aktuell angemeldeten User hoch.
     * 
     * @param file           Die hochzuladende Bilddatei.
     * @param authentication Die Authentifizierungsinformationen des aktuell
     *                       angemeldeten Benutzers.
     * @return Eine ResponseEntity mit dem aktualisierten Benutzerprofil.
     */
    @Operation(summary = "Profilbild hochladen", description = "Lädt ein Profilbild für den aktuell angemeldeten User hoch")
    @PutMapping(value = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User updatedUser = userService.uploadProfileImage(username, file);

            UserResponse response = new UserResponse(updatedUser);

            log.info("Profilbild erfolgreich hochgeladen für User: {}", username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Fehler beim Hochladen des Profilbilds: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Ruft das Profil des aktuell angemeldeten Users ab.
     * 
     * @param authentication Die Authentifizierungsinformationen des aktuell
     *                       angemeldeten Benutzers.
     * @return Eine ResponseEntity mit dem Benutzerprofil.
     */
    @Operation(summary = "User-Profil abrufen", description = "Gibt das Profil des aktuell angemeldeten Users zurück")
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getUserProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);

        UserResponse response = new UserResponse(user);

        return ResponseEntity.ok(response);
    }

    /**
     * Aktualisiert das Profil des aktuell angemeldeten Users.
     * 
     * @param request        Die neuen Profilinformationen.
     * @param authentication Die Authentifizierungsinformationen des aktuell
     *                       angemeldeten Benutzers.
     * @return Eine ResponseEntity mit dem aktualisierten Benutzerprofil.
     */
    @Operation(summary = "User-Profil aktualisieren", description = "Aktualisiert das Profil des aktuell angemeldeten Users")
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateUserProfile(
            @RequestBody UserUpdateRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        User updatedUser = userService.updateUserProfile(username, request);
        UserResponse response = new UserResponse(updatedUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Löscht das Profilbild des aktuell angemeldeten Users.
     * 
     * @param authentication Die Authentifizierungsinformationen des aktuell
     *                       angemeldeten Benutzers.
     * @return Eine ResponseEntity mit dem aktualisierten Benutzerprofil ohne
     *         Profilbild.
     */
    @Operation(summary = "Profilbild löschen", description = "Löscht das Profilbild des aktuell angemeldeten Users")
    @DeleteMapping("/profile-image")
    public ResponseEntity<UserResponse> deleteProfileImage(Authentication authentication) {
        try {
            String username = authentication.getName();
            User updatedUser = userService.deleteProfileImage(username);

            UserResponse response = new UserResponse(updatedUser);

            log.info("Profilbild erfolgreich gelöscht für User: {}", username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Fehler beim Löschen des Profilbilds: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Weist einem anderen Benutzer die ROLE_ADMIN zu. Nur für bestehende Admins
     * oder Ausbilder.
     * 
     * @param username       Der Benutzername des Benutzers, dem die Admin-Rolle
     *                       zugewiesen werden soll.
     * @param authentication Die Authentifizierungsinformationen des aktuell
     *                       angemeldeten Benutzers.
     * @return Eine ResponseEntity mit dem Ergebnis der Operation.
     */
    @Operation(summary = "Admin-Rolle zuweisen", description = "Weist einem anderen Benutzer die ROLE_ADMIN zu. Nur für bestehende Admins oder Ausbilder.")
    @PutMapping("/{username}/grant-admin")
    @PreAuthorize("hasRole('ADMIN') or @nachweisSecurityService.isAusbilder(authentication)")
    public ResponseEntity<String> grantAdmin(@PathVariable("username") String username, Authentication authentication) {
        try {
            String caller = (authentication != null) ? authentication.getName() : "system";
            userService.grantAdminRoleToUser(username, caller);
            return ResponseEntity.ok("ROLE_ADMIN erfolgreich zugewiesen an " + username);
        } catch (IllegalArgumentException e) {
            log.warn("Grant admin fehlgeschlagen: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Fehler beim Zuweisen von ROLE_ADMIN: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Fehler beim Zuweisen der Rolle");
        }
    }

    /**
     * Entzieht einem Benutzer die ROLE_ADMIN. Nur für bestehende Admins oder
     * Ausbilder.
     * 
     * @param username       Der Benutzername des Benutzers, dem die Admin-Rolle
     *                       entzogen werden soll.
     * @param authentication Die Authentifizierungsinformationen des aktuell
     *                       angemeldeten Benutzers.
     * @param keepAsNoRole   Optionaler Parameter, um den Benutzer ohne Rolle zu
     *                       belassen.
     * @return Eine ResponseEntity mit dem Ergebnis der Operation.
     */
    @Operation(summary = "Admin-Rolle entziehen", description = "Entzieht einem Benutzer die ROLE_ADMIN. Nur für bestehende Admins oder Ausbilder.")
    @DeleteMapping("/{username}/revoke-admin")
    @PreAuthorize("hasRole('ADMIN') or @nachweisSecurityService.isAusbilder(authentication)")
    public ResponseEntity<String> revokeAdmin(@PathVariable("username") String username,
            Authentication authentication,
            @RequestParam(value = "keepAsNoRole", defaultValue = "false") boolean keepAsNoRole) {
        try {
            // Prevent self-revoke in specific cases:
            // - if caller is ADMIN -> prevent self-revoke
            // - if caller is Ausbilder (and not admin) -> also prevent self-revoke
            if (authentication != null && authentication.getName().equals(username)) {
                String caller = authentication.getName();
                boolean callerIsAdmin = userService.isAdmin(caller);
                boolean callerIsAusbilder = nachweisSecurityService.isAusbilder(authentication);

                if (callerIsAdmin || (callerIsAusbilder && !callerIsAdmin)) {
                    log.warn("Benutzer {} versucht, sich selbst die Admin-Rolle zu entziehen (verboten)", caller);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Entziehen nicht erlaubt: Sie können sich nicht selbst die Admin-Rolle entziehen.");
                }
                // otherwise allow (shouldn't normally happen because only admins/ausbilder can
                // call),
                // but we fall through to allow self-revoke for callers that are neither admin
                // nor ausbilder.
            }

            String caller = (authentication != null) ? authentication.getName() : "system";
            userService.revokeAdminRoleFromUser(username, caller, keepAsNoRole);
            return ResponseEntity.ok("ROLE_ADMIN erfolgreich entzogen von " + username);
        } catch (IllegalArgumentException e) {
            log.warn("Revoke admin fehlgeschlagen: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            // z.B. letzter Admin
            log.warn("Revoke admin abgebrochen: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Fehler beim Entziehen von ROLE_ADMIN: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Fehler beim Entfernen der Rolle");
        }
    }

    /**
     * Löscht einen Benutzer und alle zugehörigen Daten (Nachweise, Profilbild).
     * Nur für Admins oder Ausbilder.
     * 
     * @param username       Der Benutzername des zu löschenden Benutzers.
     * @param authentication Die Authentifizierungsinformationen des aktuell
     *                       angemeldeten Benutzers.
     * @return Eine ResponseEntity mit dem Ergebnis der Löschoperation.
     */
    @Operation(summary = "Benutzer löschen", description = "Löscht einen Benutzer und alle zugehörigen Daten (Nachweise, Profilbild). Nur für Admins oder Ausbilder.")
    @DeleteMapping("/{username}")
    @PreAuthorize("hasRole('ADMIN') or @nachweisSecurityService.isAusbilder(authentication)")
    public ResponseEntity<String> deleteUser(@PathVariable String username, Authentication authentication) {
        if (authentication.getName().equals(username)) {
            return ResponseEntity.badRequest().body("Sie können sich nicht selbst löschen.");
        }
        try {
            userService.deleteUser(username, authentication.getName());
            return ResponseEntity
                    .ok("Benutzer " + username + " und alle zugehörigen Daten wurden erfolgreich gelöscht.");
        } catch (Exception e) {
            log.error("Fehler beim Löschen von Benutzer {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Fehler beim Löschen des Benutzers.");
        }
    }

    /**
     * Ruft alle Benutzer ab mit optionalen Filtern, Sortierung und Pagination.
     * Nur für Administratoren zugänglich.
     *
     * @param search          Optionaler Suchbegriff für Benutzername, Vorname oder Nachname.
     * @param team            Optionaler Filter für das Team.
     * @param ausbildungsjahr Optionaler Filter für das Ausbildungsjahr.
     * @param rolle           Optionaler Filter für die Rolle.
     * @param pageable        Pagination- und Sortierungsinformationen.
     * @return Seite mit Benutzerantworten.
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ruft alle Benutzer ab", description = "Gibt eine Liste aller Benutzer im System zurück. Nur für Administratoren zugänglich.")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String team,
            @RequestParam(required = false) Integer ausbildungsjahr,
            @RequestParam(required = false) String rolle,
            Pageable pageable) {
        Page<User> users = userService.findAllWithFilters(search, team, ausbildungsjahr, rolle, pageable);
        Page<UserResponse> userResponsePage = users.map(UserResponse::new);
        return ResponseEntity.ok(userResponsePage);
    }

    /*
     * Aktualisiert das Profil eines bestimmten Benutzers durch einen Administrator.
     * 
     * @param username Der Benutzername des zu aktualisierenden Benutzers.
     * 
     * @param request Die neuen Profilinformationen.
     * 
     * @return Das aktualisierte Benutzerprofil.
     */
    @PutMapping("/users/{username}/profile")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Aktualisiert das Profil eines Benutzers", description = "Aktualisiert die Profilinformationen eines bestimmten Benutzers. Nur für Administratoren zugänglich.")
    public ResponseEntity<UserResponse> updateUserProfileByAdmin(@PathVariable String username,
            @RequestBody UserUpdateRequest request) {
        User updatedUser = userService.updateUserProfileByAdmin(username, request);
        return ResponseEntity.ok(new UserResponse(updatedUser));
    }
}
