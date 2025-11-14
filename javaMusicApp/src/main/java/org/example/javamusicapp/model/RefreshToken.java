package org.example.javamusicapp.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id; // NEUER Import
import org.springframework.data.redis.core.RedisHash; // NEUER Import
import org.springframework.data.redis.core.index.Indexed;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// Wir definieren den Hash-Namen und die Lebensdauer in Sekunden (hier 30 Tage)
@RedisHash(value = "refresh_token", timeToLive = 2592000L)
public class RefreshToken {

    // @Id kommt jetzt von Spring Data Commons/Redis, NICHT von JPA
    @Id
    private String id;

    @Indexed // Wichtig! Damit findByToken() funktioniert
    private String token; // Der eigentliche Refresh-String

    // KEIN @OneToOne MEHR: Wir speichern die User-ID oder das User-Objekt direkt
    private UUID userId;

    private Instant expiryDate;

}