package org.example.springboot.repository;

import org.example.springboot.model.ToDo;
import org.example.springboot.model.enums.ETodo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ToDoRepository extends JpaRepository<ToDo, UUID> {
    Optional<ToDo> findByTitle(String title);

    List<ToDo> findByStatus(ETodo status);

    // Find todos for a user by username
    List<ToDo> findByUserUsername(String username);
}
