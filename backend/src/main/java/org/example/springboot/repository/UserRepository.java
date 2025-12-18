package org.example.springboot.repository;

import org.example.springboot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import org.example.springboot.model.enums.ERole;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    // Count users that have a role with the given enum name
    long countByRoles_Name(ERole roleName);

    java.util.List<User> findAllByRoles_Name(ERole roleName);

    // Find all users whose trainer field matches the given trainer
    java.util.List<User> findAllByTrainer(User trainer);

}
