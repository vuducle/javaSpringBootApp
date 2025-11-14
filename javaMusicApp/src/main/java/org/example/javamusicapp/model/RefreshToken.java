package org.example.javamusicapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Date;

@Entity
@Table(name = "refresh_token") // Neue Tabelle in PostgreSQL
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name="user_id", referencedColumnName = "id")
    private User user;

    @Column(unique = true, nullable = false)
    private String token;

    // Manuelle Hinzufügung des Getters, um die IDE zu befriedigen
    @Column(nullable = false)
    private Instant expiryDate;

}
