package org.example.springboot.repository;

import org.example.springboot.model.BackupMetaData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BackupRepository extends JpaRepository<BackupMetaData, String> {
    List<BackupMetaData> findByStatusOrderByCreatedAtDesc(String status);
    List<BackupMetaData> findByCreatedAtBefore(LocalDateTime date);
}
