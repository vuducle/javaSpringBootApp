package org.example.javamusicapp.controller.todoContoller;

import org.example.javamusicapp.controller.todoContoller.dto.CreateToDoRequest;
import org.example.javamusicapp.controller.todoContoller.dto.ToDoResponse;
import org.example.javamusicapp.model.ToDo;
import org.example.javamusicapp.service.ToDoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class ToDoController {
    private final ToDoService toDoService;

    public ToDoController(ToDoService toDoService) {
        this.toDoService = toDoService;
    }

    @PostMapping
    @Operation(summary = "Create ToDo", description = "Creates a new ToDo owned by the authenticated user", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(schema = @Schema(implementation = CreateToDoRequest.class))), responses = {
            @ApiResponse(responseCode = "201", description = "Created", content = @Content(schema = @Schema(implementation = ToDoResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "429", description = "Too Many Requests")
    })
    public ResponseEntity<ToDoResponse> createToDo(
            @org.springframework.web.bind.annotation.RequestBody CreateToDoRequest request, Principal principal) {
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

    @GetMapping("/me")
    @Operation(summary = "Get todos from current user", description = "Get todos from current user", responses = {
            @ApiResponse(responseCode = "201", description = "Get", content = @Content(schema = @Schema(implementation = ToDoResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "429", description = "Too Many Requests")
    })
    public ResponseEntity<List<ToDoResponse>> listMyToDos(Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String username = principal.getName();
        List<ToDoResponse> result = toDoService.findByUserUsername(username).stream()
                .map(created -> new ToDoResponse(
                        created.getId(),
                        created.getTitle(),
                        created.getDescription(),
                        created.getStatus(),
                        created.getUser().getId(),
                        created.getUser().getUsername()))
                .collect(Collectors.toList());
        return new ResponseEntity<>(result, HttpStatus.OK);
    }


}