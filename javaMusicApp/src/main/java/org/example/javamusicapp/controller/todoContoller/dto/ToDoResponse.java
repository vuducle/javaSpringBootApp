package org.example.javamusicapp.controller.todoContoller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.javamusicapp.model.enums.ETodo;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ToDoResponse {
    private UUID id;
    private String title;
    private String description;
    private ETodo status;
    private UUID userId;
    private String username;
}
