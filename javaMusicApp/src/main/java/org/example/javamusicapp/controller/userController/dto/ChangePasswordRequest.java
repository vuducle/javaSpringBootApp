package org.example.javamusicapp.controller.userController.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.example.javamusicapp.validation.PasswordStrength;

@Data
public class ChangePasswordRequest {
    @NotBlank(message = "Altes Passwort ist erforderlich")
    private String oldPassword;

    @NotBlank(message = "Neues Passwort ist erforderlich")
    @PasswordStrength
    private String newPassword;
}
