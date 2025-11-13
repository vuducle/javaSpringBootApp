package org.example.javamusicapp.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
    private String email;
}
