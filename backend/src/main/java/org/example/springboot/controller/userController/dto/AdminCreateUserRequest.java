package org.example.springboot.controller.userController.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class AdminCreateUserRequest {

    @NotBlank(message = "Benutzername darf nicht leer sein")
    @Size(min = 3, max = 50, message = "Benutzername muss zwischen 3 und 50 Zeichen lang sein")
    private String username;

    @NotBlank(message = "Name darf nicht leer sein")
    @Size(max = 100, message = "Name darf nicht länger als 100 Zeichen sein")
    private String name;

    @NotBlank(message = "E-Mail darf nicht leer sein")
    @Email(message = "Gültige E-Mail-Adresse erforderlich")
    @Size(max = 100, message = "E-Mail darf nicht länger als 100 Zeichen sein")
    private String email;

    private Integer ausbildungsjahr;

    private String telefonnummer;

    private String team;

    @Size(min = 1, message = "Mindestens eine Rolle muss zugewiesen sein")
    private Set<String> roles;
}
