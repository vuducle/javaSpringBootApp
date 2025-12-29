package org.example.springboot.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * 💅 **Was geht hier ab?**
 * Diese Klasse pimpt unsere API-Doku. Sie nutzt OpenAPI (aka Swagger), um
 * automatisch 'ne interaktive Webseite
 * zu generieren, auf der alle API-Endpunkte gelistet sind. Richtig lit, weil
 * man da direkt testen kann,
 * welche Daten man senden muss und was zurückkommt.
 *
 * Außerdem fügt sie den "Authorize"-Button hinzu, damit man seinen JWT-Token
 * eingeben und auch die
 * geschützten Endpunkte easy testen kann. Spart massiv Zeit, weil man nicht
 * alles manuell
 * in Postman oder so reinhacken muss.
 * 
 * **Swagger UI:** http://localhost:8080/swagger-ui.html
 * **ReDoc:** http://localhost:8080/redoc.html
 * **OpenAPI JSON:** http://localhost:8080/v3/api-docs
 * **OpenAPI YAML:** http://localhost:8080/v3/api-docs.yaml
 */
@Configuration
public class OpenApiConfig {

        @Bean
        public OpenAPI customOpenAPI() {
                // Define a bearerAuth security scheme so Swagger UI shows the Authorize button
                SecurityScheme bearerScheme = new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .in(SecurityScheme.In.HEADER)
                                .name("Authorization");

                return new OpenAPI()
                                .components(new Components().addSecuritySchemes("bearerAuth", bearerScheme))
                                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                                .info(new Info()
                                                .title("Lyrics Translator - Ausbildungsnachweis System")
                                                .version("1.0.0")
                                                .description("REST API für ein KI-gestütztes Ausbildungsnachweis-System mit Ollama Integration.\n\n"
                                                                +
                                                                "**System-Übersicht:**\n" +
                                                                "- 🤖 **KI-Modell:** Ollama Gemma3:1b\n" +
                                                                "- 👩‍🏫 **KI-Persona:** Triesnha Ameilya - IT-Ausbilderin und Teamleiterin\n"
                                                                +
                                                                "- 🎯 **Zweck:** Bewertung von Ausbildungsnachweisen, Feedback für Azubis\n"
                                                                +
                                                                "- 💾 **Datenbank:** PostgreSQL\n" +
                                                                "- 🔐 **Authentifizierung:** JWT Tokens\n" +
                                                                "\n**Ollama Service:**\n" +
                                                                "- Basis-URL: http://localhost:11434/\n" +
                                                                "- Modell: gemma3:1b\n" +
                                                                "- Stellen Sie sicher, dass Ollama vor dem Start läuft!\n"
                                                                +
                                                                "\n**API-Struktur:**\n" +
                                                                "- `/api/nachweis/**` - Nachweis-Management\n" +
                                                                "- `/api/nachweis/ai/**` - KI-basierte Bewertung\n" +
                                                                "- `/api/users/**` - Benutzerverwaltung")
                                                .contact(new Contact()
                                                                .name("Vu Duc Le")
                                                                .email("vu@example.com")
                                                                .url("https://github.com"))
                                                .license(new License()
                                                                .name("MIT License")
                                                                .url("https://opensource.org/licenses/MIT")))
                                .servers(List.of(
                                                new Server()
                                                                .url("http://localhost:8088")
                                                                .description("Development Server - Backend API"),
                                                new Server()
                                                                .url("http://localhost:3000")
                                                                .description("Frontend Development - Next.js Client"),
                                                new Server()
                                                                .url("http://localhost:11434")
                                                                .description("Ollama AI Service")));
        }
}