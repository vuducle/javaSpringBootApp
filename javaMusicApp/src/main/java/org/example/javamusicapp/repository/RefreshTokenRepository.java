package org.example.javamusicapp.repository;

import jakarta.transaction.Transactional;
import org.example.javamusicapp.model.RefreshToken;
import org.example.javamusicapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    public

    UserRepository getUserRepository();
    Optional<RefreshToken> findByUserAndToken(User user, String token);
    // Suche den Token-Eintrag anhand des langen Token-Strings
    Optional<RefreshToken> findByToken(String token);

    // Lösche den Token für diesen Benutzer, z.B. bei Logout

    @Transactional
    int deleteByUser(User user);
}
