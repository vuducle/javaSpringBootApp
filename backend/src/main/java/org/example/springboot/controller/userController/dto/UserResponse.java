package org.example.springboot.controller.userController.dto;

import org.example.springboot.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String username;
    private String name;
    private String email;
    private String profileImageUrl;
    private Integer ausbildungsjahr;
    private String telefonnummer;
    private String team;
    private List<String> roles;

    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.name = user.getName();
        this.email = user.getEmail();
        this.profileImageUrl = user.getProfileImageUrl();
        this.ausbildungsjahr = user.getAusbildungsjahr();
        this.telefonnummer = user.getTelefonnummer();
        this.team = user.getTeam();
        this.roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());
    }
}
