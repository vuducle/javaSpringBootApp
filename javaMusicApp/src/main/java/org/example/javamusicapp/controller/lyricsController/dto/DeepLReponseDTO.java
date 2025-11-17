package org.example.javamusicapp.controller.lyricsController.dto;

import lombok.Data;

import java.util.List;

@Data
public class DeepLReponseDTO {
    private List<Translation> translations;

    @Data
    public static class Translation {
        private String detected_source_language;
        private String text;
    }
}
