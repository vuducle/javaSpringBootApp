package org.example.springboot.controller.userController.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.UUID;

@Data
public class UserUpdateRequest {
    @Size(min = 2, max = 100, message = "Name muss zwischen 2 und 100 Zeichen lang sein")
    private String name;

    @Email(message = "Ungültige E-Mail-Adresse")
    private String email;

    @Size(min = 3, max = 50, message = "Benutzername muss zwischen 3 und 50 Zeichen lang sein")
    private String username;

    private Integer ausbildungsjahr;
    private String telefonnummer;
    private UUID trainerId;
}
