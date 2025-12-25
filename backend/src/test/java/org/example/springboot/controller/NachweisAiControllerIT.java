package org.example.springboot.controller;

import org.example.springboot.dto.NachweisAiReviewRequest;
import org.example.springboot.dto.ActivityDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration Tests für NachweisAiController
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("NachweisAiController Integration Tests")
class NachweisAiControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Health Check - sollte OK zurückgeben")
    void testHealthCheck() throws Exception {
        mockMvc.perform(get("/api/nachweis/ai/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OK"))
                .andExpect(jsonPath("$.ai_model").value("gemma3:1b"))
                .andExpect(jsonPath("$.ai_provider").value("Ollama"));
    }

    @Test
    @DisplayName("AI Info - sollte KI-Details zurückgeben")
    void testGetAiInfo() throws Exception {
        mockMvc.perform(get("/api/nachweis/ai/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ai_name").value("Triesnha Ameilya"))
                .andExpect(jsonPath("$.ai_role").value("IT-Ausbilderin und Teamleiterin"))
                .andExpect(jsonPath("$.ai_model").value("gemma3:1b"));
    }

    @Test
    @DisplayName("Sample Activity - sollte Beispiel-Aktivität zurückgeben")
    void testGetSampleActivity() throws Exception {
        mockMvc.perform(get("/api/nachweis/ai/sample"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.sample_activity.day").exists())
                .andExpect(jsonPath("$.sample_activity.hours").exists());
    }

    @Test
    @DisplayName("Test Endpoint - sollte mit Beispieldaten die KI testen")
    void testAiSystemWithSampleData() throws Exception {
        mockMvc.perform(get("/api/nachweis/ai/test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.test_data_count").value(5))
                .andExpect(jsonPath("$.ai_result").exists())
                .andExpect(jsonPath("$.ai_result.akzeptiert").isBoolean())
                .andExpect(jsonPath("$.ai_result.status").exists())
                .andExpect(jsonPath("$.ai_result.feedback").exists())
                .andExpect(jsonPath("$.ai_result.gefundeneSkills").isArray())
                .andExpect(jsonPath("$.ai_result.warnungen").isArray());
    }

    @Test
    @DisplayName("Review Nachweis - sollte Nachweis bewerten")
    void testReviewNachweis() throws Exception {
        // Arrange
        NachweisAiReviewRequest request = new NachweisAiReviewRequest(
                UUID.randomUUID(),
                Arrays.asList(
                        new ActivityDTO("Montag", BigDecimal.valueOf(8),
                                "Entwicklung einer REST-API mit Spring Boot",
                                "Backend"),
                        new ActivityDTO("Dienstag", BigDecimal.valueOf(8),
                                "Unit-Tests und Debugging",
                                "Backend"),
                        new ActivityDTO("Mittwoch", BigDecimal.valueOf(6),
                                "Code-Review und Dokumentation",
                                "Backend")));

        // Act & Assert
        mockMvc.perform(post("/api/nachweis/ai/review")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("Nachweis-Review erfolgreich"))
                .andExpect(jsonPath("$.aktivitätenAnzahl").value(3))
                .andExpect(jsonPath("$.ai_review").exists())
                .andExpect(jsonPath("$.ai_review.akzeptiert").isBoolean());
    }

    @Test
    @DisplayName("Review Nachweis mit leeren Aktivitäten - sollte Fehler zurückgeben")
    void testReviewNachweisWithEmptyActivities() throws Exception {
        // Arrange
        NachweisAiReviewRequest request = new NachweisAiReviewRequest(
                UUID.randomUUID(),
                Arrays.asList() // Leere Liste
        );

        // Act & Assert
        mockMvc.perform(post("/api/nachweis/ai/review")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("ERROR"))
                .andExpect(jsonPath("$.message").value("Keine Aktivitäten im Request vorhanden"));
    }

    @Test
    @DisplayName("Review Nachweis mit komplexem Szenario")
    void testReviewNachweisComplexScenario() throws Exception {
        // Arrange - eine ganze Woche mit realistischen Daten
        NachweisAiReviewRequest request = new NachweisAiReviewRequest(
                UUID.randomUUID(),
                Arrays.asList(
                        new ActivityDTO("Montag", BigDecimal.valueOf(8),
                                "Setup neues Projekt: Spring Boot 3.0, PostgreSQL, Maven. Initial Konfiguration und Datenbankschema erstellt",
                                "Backend"),
                        new ActivityDTO("Dienstag", BigDecimal.valueOf(8),
                                "Implementierung User Entity, JPA Repository und basic CRUD REST-APIs (GET, POST, PUT, DELETE)",
                                "Backend"),
                        new ActivityDTO("Mittwoch", BigDecimal.valueOf(6),
                                "Unit Tests mit JUnit 5 und Mockito geschrieben. 85% Code Coverage erreicht",
                                "Backend"),
                        new ActivityDTO("Donnerstag", BigDecimal.valueOf(8),
                                "Authentication implementiert: JWT, Spring Security Config, Password Encryption",
                                "Backend"),
                        new ActivityDTO("Freitag", BigDecimal.valueOf(4),
                                "Code Review, Cleanup und Dokumentation. Vorbereitung für nächste Feature",
                                "Backend")));

        // Act & Assert
        mockMvc.perform(post("/api/nachweis/ai/review")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.aktivitätenAnzahl").value(5))
                .andExpect(jsonPath("$.ai_review.akzeptiert").isBoolean())
                .andExpect(jsonPath("$.ai_review.feedback").isString())
                .andExpect(jsonPath("$.ai_review.gefundeneSkills").isArray());
    }
}
