package org.example.javamusicapp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.javamusicapp.auth.JwtUtil;
import org.example.javamusicapp.dto.AuthResponse;
import org.example.javamusicapp.dto.LoginRequest;
import org.example.javamusicapp.model.RefreshToken;
import org.example.javamusicapp.model.User;
import org.example.javamusicapp.repository.UserRepository;
import org.example.javamusicapp.service.RefreshTokenService;
import org.example.javamusicapp.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentifizierung", description = "Registrierung, Login und Token-Verwaltung für die App-Sicherheit.") // NEU
public class AuthController {
    // Spring injiziert alle notwendigen Komponenten
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            UserService userService,
            RefreshTokenService refreshTokenService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
    }

    // --- 1. REGISTRIERUNG ---
    @PostMapping("/register")
    @Operation(summary = "Registriert einen neuen Benutzer",
            description = "Speichert den Benutzer mit gehashtem Passwort in PostgreSQL. Gibt 201 Created zurück.") // NEU
    public ResponseEntity<?> registerUser(@RequestBody LoginRequest request) {

        // Prüfung auf Duplikate (sauberer Code!)
        if (userRepository.existsByUsername(request.getUsername())) {
            return new ResponseEntity<>("Benutzername ist bereits vergeben!", HttpStatus.BAD_REQUEST);
        }

        // Neues User-Objekt erstellen
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // Passwort hashen (WICHTIG!)
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        return new ResponseEntity<>("Benutzer erfolgreich registriert!", HttpStatus.CREATED);
    }

    // --- 2. LOGIN ---
    @PostMapping("/login")
    @Operation(summary = "Meldet Benutzer an",
            description = "Prüft Credentials, gibt bei Erfolg ein JWT-Token zurück, das für geschützte Endpunkte benötigt wird.") // NEU
    public ResponseEntity<AuthResponse> authenticateUser(@RequestBody LoginRequest request) {

        // 1. Authentifizierung prüfen (diese Zeile löst den AuthenticationProvider aus!)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        // 2. UserDetails vom UserService holen
        UserDetails userDetails = userService.loadUserByUsername(request.getUsername());

        // 3. JWT-Token generieren
        String token = jwtUtil.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken((User) userDetails);
        // 4. Antwort an Flutter zurückgeben
        AuthResponse response = new AuthResponse();
        response.setAccessToken(token);
        response.setRefreshToken(refreshToken.getToken());
        response.setUsername(request.getUsername());

        // Token im Format { "token": "DEIN_JWT_HIER", "username": "..." } zurücksenden
        return ResponseEntity.ok(response);
    }
}
