package org.example.springboot.controller.todoContoller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.example.springboot.model.enums.ETodo;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "CreateToDoRequest", description = "Payload to create a new ToDo")
public class CreateToDoRequest {
    @Schema(description = "Short title for the todo", example = "Buy groceries")
    private String title;

    @Schema(description = "Detailed description", example = "Milk, eggs, bread")
    private String description;

    @Schema(description = "Status of the todo", example = "UNCHECKED")
    private ETodo status;
}
