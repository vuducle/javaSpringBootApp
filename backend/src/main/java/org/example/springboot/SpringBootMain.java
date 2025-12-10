package org.example.springboot;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@OpenAPIDefinition(
        info = @Info(
                title="Spring Boot API",
                version="1.0.0",
                description = "Backend-Service für für Allrounder Zwecker, Java beste!",
                contact = @Contact(
                        name = "Denis Kunz - Der beste Java-Entwickler in Berlin, Deutschland",
                        email = "deniskunz@example.com"
                )
        )
)

@SpringBootApplication
@EnableAsync
public class SpringBootMain {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootMain.class, args);
    }

}
