package org.example.javamusicapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.javamusicapp.model.enums.ETodo;

import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@Table(name = "todo")
@JsonIgnoreProperties({ "user.todos" })
public class ToDo {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ETodo status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
