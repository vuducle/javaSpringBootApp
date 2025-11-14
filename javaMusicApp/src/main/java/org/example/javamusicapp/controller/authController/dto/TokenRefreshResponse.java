package org.example.javamusicapp.controller.authController.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@Schema(name = "TokenRefreshResponse", description = "Response returned after refreshing the access token")
public class TokenRefreshResponse {
    @Schema(description = "New access token", example = "eyJhbGci...", accessMode = Schema.AccessMode.READ_ONLY)
    private String accessToken;

    @Schema(description = "Refresh token (unchanged)", example = "f47ac10b-58cc-4372-a567-0e02b2c3d479")
    private String refreshToken;

    @Schema(description = "Username for which token was refreshed", example = "julianguyen")
    private String username;

    @Schema(description = "Token type", example = "Bearer")
    private String tokenType = "Bearer";
}
