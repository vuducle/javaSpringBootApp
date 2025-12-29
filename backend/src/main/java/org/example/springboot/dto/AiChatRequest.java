package org.example.springboot.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO für Chat-Anfrage an das LLM
 */
@Schema(description = "Request für einen Chat-Austausch mit dem LLM")
@JsonIgnoreProperties(ignoreUnknown = true)
public record AiChatRequest(
        @Schema(description = "Die Nachricht/Frage des Benutzers", example = "Wie kann ich besser programmieren?") String message,

        @Schema(description = "Optionaler Kontext (z.B. bisheriges Gespräch)", example = "Ich bin ein Azubi im 1. Jahr") String context) {
}
