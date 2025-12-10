package org.example.springboot.controller.todoContoller.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.example.springboot.model.enums.ETodo;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateToDoRequest {
    // all fields nullable — PATCH semantics
    private String title;
    private String description;
    private ETodo status;
}
