package org.example.javamusicapp.repository;

import jakarta.transaction.Transactional;
import org.example.javamusicapp.model.RefreshToken;
import org.example.javamusicapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    // Suche den Token-Eintrag anhand des langen Token-Strings
    Optional<RefreshToken> findByToken(String token);

    // Löscht alle Tokens für den User und gibt die Anzahl der gelöschten Zeilen zurück
    @Transactional
    int deleteByUser(User user);
}
