package org.example.springboot.repository;

import org.example.springboot.model.RoleAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleAuditRepository extends JpaRepository<RoleAudit, Long> {

}
