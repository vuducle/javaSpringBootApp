package org.example.springboot.service.auth;

import org.example.springboot.model.EmailVerificationToken;
import org.example.springboot.model.User;
import org.example.springboot.repository.EmailVerificationTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailVerificationTokenServiceTest {

    @Mock
    private EmailVerificationTokenRepository tokenRepository;

    @InjectMocks
    private EmailVerificationTokenService tokenService;

    private User testUser;
    private EmailVerificationToken testToken;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setEmailVerified(false);

        testToken = new EmailVerificationToken();
        testToken.setId(1L);
        testToken.setToken(UUID.randomUUID().toString());
        testToken.setUser(testUser);
        testToken.setExpiryDate(Instant.now().plusSeconds(86400)); // 24 hours
        testToken.setUsed(false);
    }

    @Test
    void createVerificationToken_shouldCreateNewToken() {
        // Given
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(tokenRepository.save(any(EmailVerificationToken.class))).thenReturn(testToken);

        // When
        EmailVerificationToken result = tokenService.createVerificationToken(testUser);

        // Then
        assertNotNull(result);
        verify(tokenRepository).save(any(EmailVerificationToken.class));
    }

    @Test
    void createVerificationToken_shouldDeleteOldTokenBeforeCreatingNew() {
        // Given
        EmailVerificationToken oldToken = new EmailVerificationToken();
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.of(oldToken));
        when(tokenRepository.save(any(EmailVerificationToken.class))).thenReturn(testToken);

        // When
        tokenService.createVerificationToken(testUser);

        // Then
        verify(tokenRepository).delete(oldToken);
        verify(tokenRepository).save(any(EmailVerificationToken.class));
    }

    @Test
    void validateToken_withValidToken_shouldReturnUser() {
        // Given
        when(tokenRepository.findByToken(testToken.getToken())).thenReturn(Optional.of(testToken));

        // When
        Optional<User> result = tokenService.validateToken(testToken.getToken());

        // Then
        assertTrue(result.isPresent());
        assertEquals(testUser.getId(), result.get().getId());
    }

    @Test
    void validateToken_withInvalidToken_shouldReturnEmpty() {
        // Given
        when(tokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        // When
        Optional<User> result = tokenService.validateToken("invalid-token");

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void validateToken_withUsedToken_shouldReturnEmpty() {
        // Given
        testToken.setUsed(true);
        when(tokenRepository.findByToken(testToken.getToken())).thenReturn(Optional.of(testToken));

        // When
        Optional<User> result = tokenService.validateToken(testToken.getToken());

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void validateToken_withExpiredToken_shouldReturnEmpty() {
        // Given
        testToken.setExpiryDate(Instant.now().minusSeconds(3600)); // Expired 1 hour ago
        when(tokenRepository.findByToken(testToken.getToken())).thenReturn(Optional.of(testToken));

        // When
        Optional<User> result = tokenService.validateToken(testToken.getToken());

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void markTokenAsUsed_shouldUpdateToken() {
        // Given
        when(tokenRepository.findByToken(testToken.getToken())).thenReturn(Optional.of(testToken));
        when(tokenRepository.save(any(EmailVerificationToken.class))).thenReturn(testToken);

        // When
        tokenService.markTokenAsUsed(testToken.getToken());

        // Then
        verify(tokenRepository).save(testToken);
        assertTrue(testToken.isUsed());
    }

    @Test
    void deleteToken_shouldDeleteTokenFromRepository() {
        // Given
        when(tokenRepository.findByToken(testToken.getToken())).thenReturn(Optional.of(testToken));

        // When
        tokenService.deleteToken(testToken.getToken());

        // Then
        verify(tokenRepository).delete(testToken);
    }

    @Test
    void hasValidToken_withValidToken_shouldReturnTrue() {
        // Given
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.of(testToken));

        // When
        boolean result = tokenService.hasValidToken(testUser);

        // Then
        assertTrue(result);
    }

    @Test
    void hasValidToken_withNoToken_shouldReturnFalse() {
        // Given
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

        // When
        boolean result = tokenService.hasValidToken(testUser);

        // Then
        assertFalse(result);
    }

    @Test
    void hasValidToken_withUsedToken_shouldReturnFalse() {
        // Given
        testToken.setUsed(true);
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.of(testToken));

        // When
        boolean result = tokenService.hasValidToken(testUser);

        // Then
        assertFalse(result);
    }

    @Test
    void hasValidToken_withExpiredToken_shouldReturnFalse() {
        // Given
        testToken.setExpiryDate(Instant.now().minusSeconds(3600));
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.of(testToken));

        // When
        boolean result = tokenService.hasValidToken(testUser);

        // Then
        assertFalse(result);
    }
}
