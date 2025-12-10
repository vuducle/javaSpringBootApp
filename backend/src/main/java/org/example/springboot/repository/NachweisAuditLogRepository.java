package org.example.springboot.repository;

import org.example.springboot.model.NachweisAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NachweisAuditLogRepository extends JpaRepository<NachweisAuditLog, Long> {
    Page<NachweisAuditLog> findAllByNachweisId(UUID nachweisId, Pageable pageable);
}
