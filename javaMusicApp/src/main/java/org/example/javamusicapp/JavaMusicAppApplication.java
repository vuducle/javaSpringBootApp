package org.example.javamusicapp;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@OpenAPIDefinition(
        info = @Info(
                title="Lyrics Translator API",
                version="0.0.1",
                description = "Backend-Service für die vietnamesisch-englische Lyrics-App.",
                contact = @Contact(
                        name = "Denis Kunz",
                        email = "deniskunz@example.com"
                )
        )
)

@SpringBootApplication
@EnableAsync
public class JavaMusicAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavaMusicAppApplication.class, args);
    }

}
