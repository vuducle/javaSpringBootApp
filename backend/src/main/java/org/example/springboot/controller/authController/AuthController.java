package org.example.springboot.controller.authController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.example.springboot.config.auth.JwtUtil;
import org.example.springboot.controller.authController.dto.*;
import org.example.springboot.exception.ResourceNotFoundException;
import org.example.springboot.handler.TokenRefreshException;
import org.example.springboot.model.PasswordResetToken;
import org.example.springboot.model.RefreshToken;
import org.example.springboot.model.Role;
import org.example.springboot.model.User;
import org.example.springboot.model.enums.ERole;
import org.example.springboot.repository.RoleRepository;
import org.example.springboot.repository.UserRepository;
import org.example.springboot.service.auth.AnmeldeversuchService;
import org.example.springboot.service.auth.PasswordResetTokenService;
import org.example.springboot.service.auth.RefreshTokenService;
import org.example.springboot.service.auth.UserService;
import org.example.springboot.service.nachweis.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;
import java.security.SecureRandom;

/**
 * 🔑 **Was geht hier ab?**
 * Dieser Controller ist die absolute Zentrale für alles, was mit Auth zu tun
 * hat.
 * Hier passiert die ganze Magie rund um Login, Registrierung und
 * Passwort-Management.
 * Alle Endpunkte hier sind public, weil man ja noch nicht eingeloggt ist.
 *
 * Die wichtigsten VIBES hier sind:
 * - /register**: Nimmt die Daten für einen neuen User, hasht das Passwort und
 * speichert
 * den Dude in der Datenbank. Standard, aber muss sein.
 * - /login**: Checkt, ob E-Mail und Passwort matchen. Wenn ja, gibt's als
 * Belohnung einen
 * Access Token (JWT) und einen Refresh Token. Der Access Token ist dein Ticket
 * für die
 * geschützten Bereiche der App.
 * /refresh**: Wenn dein Access Token abgelaufen ist (die sind kurzlebig),
 * schickst du
 * deinen langlebigen Refresh Token hierher und kriegst 'nen brandneuen Access
 * Token zurück.
 * So bleibst du eingeloggt, ohne jedes Mal dein Passwort neu einzugeben.
 * /forgot-password & /reset-password**: Wenn du dein Passwort vercheckt hast,
 * kannst du
 * hier 'nen Link anfordern, um es zurückzusetzen.
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentifizierung", description = "Registrierung, Login und Token-Verwaltung für die App-Sicherheit.")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final RoleRepository roleRepository;
    private final PasswordResetTokenService passwordResetTokenService;
    private final EmailService emailService;
    private final AnmeldeversuchService anmeldeversuchService;
    private final UserService userService;
    private final String frontendUrl;
    @org.springframework.beans.factory.annotation.Value("${jwt.expiration.ms}")
    private long jwtExpirationMs;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            RefreshTokenService refreshTokenService,
            RoleRepository roleRepository,
            PasswordResetTokenService passwordResetTokenService,
            EmailService emailService,
            AnmeldeversuchService anmeldeversuchService,
            UserService userService,
            @Value("${app.frontend.url}") String frontendUrl) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.roleRepository = roleRepository;
        this.passwordResetTokenService = passwordResetTokenService;
        this.emailService = emailService;
        this.anmeldeversuchService = anmeldeversuchService;
        this.userService = userService;
        this.frontendUrl = frontendUrl;
    }

    /**
     * Dieser Entpunkt ist zuständig für die Registrierung
     */
    @PostMapping("/register")
    @Operation(summary = "Registriert einen neuen Benutzer", description = "Speichert den Benutzer mit einem zufällig generierten Passwort und sendet die Zugangsdaten per E-Mail.")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return new ResponseEntity<>("Benutzername ist bereits vergeben!", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return new ResponseEntity<>("E-Mail wird bereits verwendet!", HttpStatus.BAD_REQUEST);
        }

        String temporaryPassword = generateRandomPassword();

        User user = new User();
        user.setUsername(request.getUsername());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setAusbildungsjahr(request.getAusbildungsjahr());
        user.setTelefonnummer(request.getTelefonnummer());
        user.setTeam(request.getTeam());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Fehler: Rolle nicht gefunden."));
        user.getRoles().add(userRole);
        userRepository.save(user);

        emailService.sendWelcomeEmailWithCredentials(user.getEmail(), user.getName(), user.getEmail(), request.getPassword());

        return new ResponseEntity<>("Benutzer erfolgreich registriert! Überprüfen Sie Ihre E-Mails für die Zugangsdaten.", HttpStatus.CREATED);
    }
    
    private String generateRandomPassword() {
        final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 12; i++) {
            int randomIndex = random.nextInt(chars.length());
            sb.append(chars.charAt(randomIndex));
        }

        return sb.toString();
    }

    /*
     * Dieser Endpunkt ist zuständig für die Authentifizierung (Login)
     */
    @PostMapping("/login")
    @Operation(summary = "Meldet Benutzer an", description = "Prüft Credentials, gibt bei Erfolg ein JWT-Token zurück, das für geschützte Endpunkte benötigt wird.")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest request) {
        if (anmeldeversuchService.istGesperrt(request.getEmail())) {
            return new ResponseEntity<>(
                    "Ihr Account ist aufgrund zu vieler Fehlversuche temporär gesperrt für 15 Minuten.",
                    HttpStatus.LOCKED);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            User userDetails = (User) authentication.getPrincipal();

            String token = jwtUtil.generateToken(userDetails);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails);

            AuthResponse response = new AuthResponse();
            response.setAccessToken(token);
            response.setRefreshToken(refreshToken.getToken());
            response.setId(userDetails.getId());
            response.setUsername(userDetails.getUsername());
            response.setEmail(userDetails.getEmail());
            response.setName(userDetails.getName());
            response.setRoles(userDetails.getRoles().stream().map(Role::getName).map(Enum::name).toList());

            // Set access token as HttpOnly cookie so Next.js middleware can read it
            // server-side. Use secure=true only when frontend uses https.
            boolean secure = frontendUrl != null && frontendUrl.startsWith("https://");
            String sameSite = secure ? "None" : "Lax";
            ResponseCookie cookie = ResponseCookie.from("accessToken", token)
                    .httpOnly(true)
                    .secure(secure)
                    .path("/")
                    .maxAge(jwtExpirationMs / 1000)
                    .sameSite(sameSite)
                    .build();

            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(response);
        } catch (AuthenticationException e) {
            log.error("Login Fehler für E-Mail {}: {}", request.getEmail(), e.getMessage());
            // Anmeldeversuch-Listener wird den Fehlversuch protokollieren.
            return new ResponseEntity<>("E-Mail oder Passwort ist ungültig.", HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Dieser Endpunkt ist zuständig für das Ausloggen
     * 
     */
    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Logs out the user: clears HttpOnly cookie and invalidates refresh token if provided")
    public ResponseEntity<?> logout(@RequestBody(required = false) Map<String, String> body) {
        String refreshToken = null;
        if (body != null) {
            refreshToken = body.get("refreshToken");
        }

        if (refreshToken != null && !refreshToken.isBlank()) {
            try {
                refreshTokenService.deleteByToken(refreshToken);
            } catch (Exception e) {
                log.warn("Fehler beim Löschen des Refresh-Tokens: {}", e.getMessage());
            }
        }

        boolean secure = frontendUrl != null && frontendUrl.startsWith("https://")
                || frontendUrl != null && frontendUrl.startsWith("http://");
        String sameSite = secure ? "None" : "Lax";
        ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(0)
                .sameSite(sameSite)
                .build();

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(java.util.Collections.singletonMap("loggedOut", true));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Erneuert den JWT Access Token", description = "Nimmt den langen Refresh Token entgegen, prüft ihn und gibt einen neuen Access Token aus.")
    public ResponseEntity<TokenRefreshResponse> refreshToken(@RequestBody TokenRefreshRequest request) {
        log.info("=== REFRESH ENDPOINT REACHED! Token: {}", request.getRefreshToken());
        String requestRefreshToken = request.getRefreshToken();
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUserId)
                .flatMap(userRepository::findById)
                .map(user -> {
                    String newAccessToken = jwtUtil.generateToken(user);
                    return ResponseEntity.ok(new TokenRefreshResponse(
                            newAccessToken,
                            requestRefreshToken,
                            user.getUsername(),
                            "Bearer "));
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
                        "Refresh Token ist ungültig oder Benutzer existiert nicht mehr!"));
    }

    /*
     * Dieser Endpunkt ist zuständig für das Anfordern eines
     * Passwort-Zurücksetzungslinks.
     * 
     */
    @PostMapping("/forgot-password")
    @Operation(summary = "Passwort zurücksetzen anfordern", description = "Sendet eine E-Mail mit einem Link zum Zurücksetzen des Passworts.")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        Optional<User> userOptional = userRepository.findByEmail(forgotPasswordRequest.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.ok(
                    "Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.");
        }

        User user = userOptional.get();
        PasswordResetToken token = passwordResetTokenService.createPasswordResetToken(user);

        String resetLink = this.frontendUrl + "/reset-password?token=" + token.getToken();

        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetLink);

        log.info("Password reset link for user {} sent to {}", user.getUsername(), user.getEmail());

        return ResponseEntity.ok(
                "Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.");
    }

    /*
     * Dieser Endpunkt ist zuständig für das Zurücksetzen des Passworts mit einem
     * gültigen Token.
     */
    @PostMapping("/reset-password")
    @Operation(summary = "Passwort zurücksetzen", description = "Setzt das Passwort des Benutzers mit einem gültigen Token zurück.")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        String token = resetPasswordRequest.getToken();
        String newPassword = resetPasswordRequest.getNewPassword();

        return passwordResetTokenService.findByToken(token)
                .map(passwordResetTokenService::verifyExpiration)
                .map(PasswordResetToken::getUser)
                .map(user -> {
                    userService.resetPassword(user, newPassword);
                    passwordResetTokenService.deleteToken(token);
                    return ResponseEntity.ok("Passwort wurde erfolgreich zurückgesetzt.");
                })
                .orElseThrow(() -> new ResourceNotFoundException("Invalid token"));
    }
}
