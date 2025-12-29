package org.example.springboot.repository;

import org.example.springboot.model.PasswordResetToken;
import org.example.springboot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(@Param("token") String token);

    Optional<PasswordResetToken> findByUser(@Param("user") User user);
}
