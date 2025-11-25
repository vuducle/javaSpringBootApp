package org.example.javamusicapp.controller.authController.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "RegistrierungsAnfrage", description = "Anfrage-Payload zum Registrieren eines neuen Benutzers")
public class RegistrationRequest {
    @Schema(description = "Eindeutiger Benutzername des Benutzers", example = "julianguyen")
    private String username;

    @Schema(description = "Vollständiger Name des Benutzers", example = "Julian Nguyen")
    private String name;

    @Schema(description = "Benutzerpasswort", example = "password123", format = "password")
    private String password;

    @Schema(description = "E-Mail-Adresse des Benutzers", example = "julianguyen@example.com")
    private String email;
}
