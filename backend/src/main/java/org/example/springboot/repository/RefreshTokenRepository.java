package org.example.springboot.repository;

import org.example.springboot.model.RefreshToken;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {
    // Suche den Token-Eintrag anhand des langen Token-Strings
    Optional<RefreshToken> findByToken(@Param("token") String token);

    Optional<RefreshToken> findByUserId(@Param("userId") UUID userId);
}
