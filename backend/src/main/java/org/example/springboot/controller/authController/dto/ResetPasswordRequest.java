package org.example.springboot.controller.authController.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.example.springboot.validation.PasswordStrength;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank
    private String token;

    @NotBlank
    @PasswordStrength
    private String newPassword;
}
