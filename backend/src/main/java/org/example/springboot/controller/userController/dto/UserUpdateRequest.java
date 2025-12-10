package org.example.springboot.controller.userController.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private Integer ausbildungsjahr;
    private String telefonnummer;
    private String team;
}
