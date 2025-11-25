package org.example.javamusicapp.controller.authController.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "LoginAnfrage", description = "Anfrage-Payload zum Anmelden eines Benutzers")
public class LoginRequest {
    @Schema(description = "Benutzerpasswort", example = "password123", format = "password")
    private String password;

    @Schema(description = "E-Mail-Adresse des Benutzers", example = "julianguyen@example.com")
    private String email;
}
