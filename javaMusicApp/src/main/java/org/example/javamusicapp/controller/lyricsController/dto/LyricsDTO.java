package org.example.javamusicapp.controller.lyricsController.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "DTO representing song lyrics and translation metadata")
public class LyricsDTO {
    @Schema(description = "Original lyrics text", example = "Ngày nắng lên em mỉm cười\nTừng bước chân nhẹ nhàng qua đời")
    private String originalLyrics;

    @Schema(description = "Translated lyrics text (target language)", example = "When the sun rises you smile\nYour steps gently pass through life")
    private String translatedLyrics;

    @Schema(description = "Song title", example = "Trên Tình Bạn, Dưới Tình Yêu (sample)")
    private String title;

    @Schema(description = "Artist name", example = "Min (sample)")
    private String artist;

    @Schema(description = "Source language code", example = "vi")
    private String sourceLang;

    @Schema(description = "Target language code", example = "en")
    private String targetLang;
}
