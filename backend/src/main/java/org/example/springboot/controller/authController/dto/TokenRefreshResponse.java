package org.example.springboot.controller.authController.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@Schema(name = "TokenAktualisierungsAntwort", description = "Antwort, die nach der Aktualisierung des Zugriffstokens zurückgegeben wird")
public class TokenRefreshResponse {
    @Schema(description = "Neues Zugriffstoken", example = "eyJhbGci...", accessMode = Schema.AccessMode.READ_ONLY)
    private String accessToken;

    @Schema(description = "Refresh-Token (unverändert)", example = "f47ac10b-58cc-4372-a567-0e02b2c3d479")
    private String refreshToken;

    @Schema(description = "Benutzername, für den der Token aktualisiert wurde", example = "julianguyen")
    private String username;

    @Schema(description = "Tokentyp", example = "Bearer")
    private String tokenType = "Bearer";
}
