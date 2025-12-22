package org.example.springboot.repository;

import org.example.springboot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import org.example.springboot.model.enums.ERole;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    /**
     * 🚀 Optimiert für Authentication - lädt Roles eager
     */
    @EntityGraph(attributePaths = { "roles" })
    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    /**
     * 🚀 Optimiert für Login - lädt Roles eager um LazyInitializationException zu
     * vermeiden
     */
    @EntityGraph(attributePaths = { "roles" })
    Optional<User> findByEmail(String email);

    // Count users that have a role with the given enum name
    long countByRoles_Name(ERole roleName);

    /**
     * 🚀 Optimiert für Audits/Reports
     */
    @EntityGraph(attributePaths = { "roles" })
    List<User> findAllByRoles_Name(ERole roleName);

    /**
     * 🚀 Optimiert - Vermeidet N+1 Problem bei Trainer-Lookup
     */
    @Query(value = "SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.trainer = :trainer")
    List<User> findAllByTrainer(User trainer);

}
