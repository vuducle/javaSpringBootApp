package org.example.javamusicapp.controller.userController.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevokeAdminResponse {
    private String message;
    private int affectedTraineesCount;
    private List<String> affectedTraineeUsernames;
}
