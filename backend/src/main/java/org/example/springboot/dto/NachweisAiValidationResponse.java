package org.example.springboot.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * DTO für das Ergebnis der vollständigen Nachweis-Validierung
 */
@Schema(description = "Response mit dem Ergebnis der vollständigen KI-Validierung eines Nachweises")
public record NachweisAiValidationResponse(
        @Schema(description = "Wurde der komplette Nachweis akzeptiert?", example = "true") boolean akzeptiert,

        @Schema(description = "Status der Validierung", example = "VALIDIERT") String status,

        @Schema(description = "Allgemeines Feedback zur Gesamtvalidierung", example = "Nachweis ist vollständig und konsistent") String feedback,

        @Schema(description = "Validierung der Metadaten (Datum, Ausbildungsjahr, etc.)") MetadataValidation metadataValidation,

        @Schema(description = "Validierung der Aktivitäten") ActivitiesValidation activitiesValidation,

        @Schema(description = "Erkannte Skills und Technologien") List<String> gefundeneSkills,

        @Schema(description = "Warnungen und Probleme") List<String> warnungen) {

    /**
     * Innerklasse für Metadaten-Validierung
     */
    public record MetadataValidation(
            @Schema(description = "Ist das Startdatum sinnvoll?", example = "true") boolean datumStartValid,

            @Schema(description = "Ist das Enddatum sinnvoll?", example = "true") boolean datumEndeValid,

            @Schema(description = "Sind Start- und Enddatum konsistent?", example = "true") boolean datumRangeValid,

            @Schema(description = "Ist das Ausbildungsjahr gültig?", example = "true") boolean ausbildungsjährValid,

            @Schema(description = "Wurde eine sinnvolle Nummer vergeben?", example = "true") boolean nummerValid,

            @Schema(description = "Feedback zu den Metadaten") String feedback) {
    }

    /**
     * Innerklasse für Aktivitäten-Validierung
     */
    public record ActivitiesValidation(
            @Schema(description = "Anzahl der eingetragenen Aktivitäten", example = "5") int anzahlAktivitäten,

            @Schema(description = "Durchschnittliche Stunden pro Tag", example = "7.5") double durchschnittlicheStunden,

            @Schema(description = "Sind alle Tage der Woche abgedeckt?", example = "true") boolean alleTageCovered,

            @Schema(description = "Sind die Stunden realistisch?", example = "true") boolean stundenRealistisch,

            @Schema(description = "Feedback zu den Aktivitäten") String feedback) {
    }
}
