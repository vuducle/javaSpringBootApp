package org.example.springboot.repository;

import org.example.springboot.model.Nachweis;
import org.example.springboot.model.enums.EStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NachweisRepository extends JpaRepository<Nachweis, UUID>, JpaSpecificationExecutor<Nachweis> {

    /**
     * 🚀 Optimiert - Eager loads azubi, ausbilder und activities
     */
    @EntityGraph(attributePaths = { "azubi", "ausbilder", "activities" })
    Optional<Nachweis> findWithActivitiesById(@Param("id") UUID id);

    /**
     * 🚀 Optimiert - Eager loads azubi und ausbilder um N+1 zu vermeiden
     */
    @EntityGraph(attributePaths = { "azubi", "ausbilder" })
    List<Nachweis> findAllByAzubiId(@Param("azubiId") UUID azubiId);

    /**
     * 🚀 Optimiert - Paginated mit eager loaded Users
     */
    @EntityGraph(attributePaths = { "azubi", "ausbilder" })
    Page<Nachweis> findAllByAzubiId(@Param("azubiId") UUID azubiId, Pageable pageable);

    /**
     * 🚀 Optimiert - Filter mit Status
     */
    @EntityGraph(attributePaths = { "azubi", "ausbilder" })
    Page<Nachweis> findAllByAzubiIdAndStatus(@Param("azubiId") UUID azubiId, @Param("status") EStatus status,
            Pageable pageable);

    /**
     * 🚀 Optimiert - Status Filter mit Pagination
     */
    @EntityGraph(attributePaths = { "azubi", "ausbilder" })
    Page<Nachweis> findAllByStatus(@Param("status") EStatus status, Pageable pageable);

    boolean existsByAusbilderUsername(@Param("username") String username);

    boolean existsByNummerAndAzubiId(@Param("nummer") int nummer, @Param("azubiId") UUID azubiId);

    /**
     * 🚀 Optimiert - COUNT Query (efficient, keine N+1)
     */
    @Query("SELECT COALESCE(MAX(n.nummer), 0) FROM Nachweis n WHERE n.azubi.id = :azubiId")
    Integer findMaxNummerByAzubiId(@Param("azubiId") UUID azubiId);
}
