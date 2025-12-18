package org.example.springboot.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.springboot.model.EmailVerificationToken;
import org.example.springboot.model.User;
import org.example.springboot.repository.EmailVerificationTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * 📧 Email Verification Token Service
 * Verwaltet die Erstellung, Validierung und Löschung von
 * E-Mail-Verifizierungs-Tokens.
 * Tokens sind 24 Stunden gültig und können nur einmal verwendet werden.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationTokenService {

    private final EmailVerificationTokenRepository tokenRepository;

    @Value("${email.verification.token.expiration.hours:24}")
    private long tokenExpirationHours;

    /**
     * Erstellt einen neuen Verifizierungs-Token für einen User
     */
    @Transactional
    public EmailVerificationToken createVerificationToken(User user) {
        // Lösche alte Tokens für diesen User
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

        // Erstelle neuen Token
        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plusSeconds(tokenExpirationHours * 3600);

        EmailVerificationToken verificationToken = new EmailVerificationToken(user, token, expiryDate);
        EmailVerificationToken saved = tokenRepository.save(verificationToken);

        log.info("Email verification token created for user: {}", user.getUsername());
        return saved;
    }

    /**
     * Validiert einen Token und gibt den zugehörigen User zurück
     */
    public Optional<User> validateToken(String token) {
        Optional<EmailVerificationToken> tokenOptional = tokenRepository.findByToken(token);

        if (tokenOptional.isEmpty()) {
            log.warn("Email verification token not found: {}", token);
            return Optional.empty();
        }

        EmailVerificationToken verificationToken = tokenOptional.get();

        if (verificationToken.isUsed()) {
            log.warn("Email verification token already used: {}", token);
            return Optional.empty();
        }

        if (verificationToken.isExpired()) {
            log.warn("Email verification token expired: {}", token);
            return Optional.empty();
        }

        return Optional.of(verificationToken.getUser());
    }

    /**
     * Markiert einen Token als verwendet
     */
    @Transactional
    public void markTokenAsUsed(String token) {
        tokenRepository.findByToken(token).ifPresent(verificationToken -> {
            verificationToken.setUsed(true);
            tokenRepository.save(verificationToken);
            log.info("Email verification token marked as used: {}", token);
        });
    }

    /**
     * Löscht einen Token
     */
    @Transactional
    public void deleteToken(String token) {
        tokenRepository.findByToken(token).ifPresent(verificationToken -> {
            tokenRepository.delete(verificationToken);
            log.info("Email verification token deleted: {}", token);
        });
    }

    /**
     * Löscht alle Tokens für einen User
     */
    @Transactional
    public void deleteTokensByUser(User user) {
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);
        log.info("All email verification tokens deleted for user: {}", user.getUsername());
    }

    /**
     * Prüft, ob ein User bereits einen gültigen Token hat
     */
    public boolean hasValidToken(User user) {
        Optional<EmailVerificationToken> tokenOptional = tokenRepository.findByUser(user);

        if (tokenOptional.isEmpty()) {
            return false;
        }

        EmailVerificationToken token = tokenOptional.get();
        return !token.isUsed() && !token.isExpired();
    }
}
