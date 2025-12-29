package org.example.springboot.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO für Chat-Antwort vom LLM
 */
@Schema(description = "Response vom LLM nach einer Chat-Anfrage")
@JsonIgnoreProperties(ignoreUnknown = true)
public record AiChatResponse(
        @Schema(description = "Die Antwort vom LLM") String response,

        @Schema(description = "Zeigt an ob die Antwort erfolgreich war") boolean success,

        @Schema(description = "Optionale Fehlermeldung falls success=false") String error) {
}
