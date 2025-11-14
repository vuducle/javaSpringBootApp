package org.example.javamusicapp.repository;

import jakarta.transaction.Transactional;
import org.example.javamusicapp.model.RefreshToken;
import org.example.javamusicapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {
    // Suche den Token-Eintrag anhand des langen Token-Strings
    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUserId(UUID userId);
}
