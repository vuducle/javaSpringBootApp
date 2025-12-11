package org.example.springboot.controller.todoContoller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.springboot.model.enums.ETodo;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "ToDoResponse", description = "Response returned after creating or fetching a ToDo")
public class ToDoResponse {
    @Schema(description = "ToDo id")
    private UUID id;

    @Schema(description = "Title")
    private String title;

    @Schema(description = "Description")
    private String description;

    @Schema(description = "Status of the todo", example = "UNCHECKED")
    private ETodo status;

    @Schema(description = "Owner user id")
    private UUID userId;

    @Schema(description = "Owner username")
    private String username;
}
