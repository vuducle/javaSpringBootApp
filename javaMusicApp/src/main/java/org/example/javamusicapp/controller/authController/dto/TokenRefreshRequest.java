package org.example.javamusicapp.controller.authController.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(name = "TokenRefreshRequest", description = "Request payload to refresh an access token using a refresh token")
public class TokenRefreshRequest {
    @NotBlank
    @Schema(description = "Refresh token string", example = "f47ac10b-58cc-4372-a567-0e02b2c3d479")
    private String refreshToken;
}
