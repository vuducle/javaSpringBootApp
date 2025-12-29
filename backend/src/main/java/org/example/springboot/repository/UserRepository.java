package org.example.springboot.repository;

import org.example.springboot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
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
    Optional<User> findByUsername(@Param("username") String username);

    Boolean existsByUsername(@Param("username") String username);

    Boolean existsByEmail(@Param("email") String email);

    /**
     * 🚀 Optimiert für Login - lädt Roles eager um LazyInitializationException zu
     * vermeiden
     */
    @EntityGraph(attributePaths = { "roles" })
    Optional<User> findByEmail(@Param("email") String email);

    // Count users that have a role with the given enum name
    long countByRoles_Name(@Param("roleName") ERole roleName);

    /**
     * 🚀 Optimiert für Audits/Reports
     */
    @EntityGraph(attributePaths = { "roles" })
    List<User> findAllByRoles_Name(@Param("roleName") ERole roleName);

    /**
     * 🚀 Optimiert - Vermeidet N+1 Problem bei Trainer-Lookup
     */
    @Query(value = "SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.trainer = :trainer")
    List<User> findAllByTrainer(User trainer);

}
