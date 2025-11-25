package org.example.javamusicapp.controller.authController.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(name = "TokenAktualisierungsAnfrage", description = "Anfrage-Payload zum Aktualisieren eines Zugriffstokens mit einem Refresh-Token")
public class TokenRefreshRequest {
    @NotBlank
    @Schema(description = "Refresh-Token-Zeichenfolge", example = "f47ac10b-58cc-4372-a567-0e02b2c3d479")
    private String refreshToken;
}
