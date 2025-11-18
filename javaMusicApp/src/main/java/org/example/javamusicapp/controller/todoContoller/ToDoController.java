package org.example.javamusicapp.controller.todoContoller;

import org.example.javamusicapp.controller.todoContoller.dto.CreateToDoRequest;
import org.example.javamusicapp.controller.todoContoller.dto.ToDoResponse;
import org.example.javamusicapp.model.ToDo;
import org.example.javamusicapp.service.ToDoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/todos")
public class ToDoController {
    private final ToDoService toDoService;

    public ToDoController(ToDoService toDoService) {
        this.toDoService = toDoService;
    }

    @PostMapping
    public ResponseEntity<ToDoResponse> createToDo(@RequestBody CreateToDoRequest request, Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String username = principal.getName();
        ToDo toDo = new ToDo();
        toDo.setTitle(request.getTitle());
        toDo.setDescription(request.getDescription());
        toDo.setStatus(request.getStatus());
        ToDo created = toDoService.createToDo(toDo, username);

        ToDoResponse response = new ToDoResponse(
                created.getId(),
                created.getTitle(),
                created.getDescription(),
                created.getStatus(),
                created.getUser().getId(),
                created.getUser().getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}