package org.example.springboot.repository;

import org.example.springboot.model.EmailVerificationToken;
import org.example.springboot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByToken(@Param("token") String token);

    Optional<EmailVerificationToken> findByUser(@Param("user") User user);

    void deleteByUser(@Param("user") User user);
}
