package org.example.javamusicapp.service.nachweis;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDVariableText;
import org.example.javamusicapp.model.Activity;
import org.example.javamusicapp.model.Nachweis;
import org.example.javamusicapp.model.enums.Weekday;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;

/**
 * 📄 **Was geht hier ab?**
 * Dieser Service ist unsere persönliche PDF-Druckerei. Er ist ein reiner
 * Spezialist,
 * der nur eine Mission hat: Ausbildungsnachweise als PDF zu generieren.
 *
 * So läuft der Hase:
 * - **generateAusbildungsnachweisPdf()**: Die Methode kriegt ein fettes
 * `Nachweis`-Objekt
 * mit allen Daten (Name, Datum, Aktivitäten etc.).
 * - Sie schnappt sich dann ein PDF-Template, das unter `resources/static`
 * liegt.
 * Dieses Template ist ein ausfüllbares PDF-Formular.
 * - Mit der Power von der Apache PDFBox-Library füllt der Service die leeren
 * Felder
 * im Template mit den Daten aus dem `Nachweis`-Objekt.
 * - Am Ende spuckt er das fertige, ausgefüllte PDF als `byte[]` (also als
 * Haufen von Nullen
 * und Einsen) aus. Dieses Byte-Array kann dann gespeichert oder per Mail
 * verschickt werden.
 */
@Slf4j
@Service
public class PdfExportService {

    private static final String TEMPLATE_PATH = "static/ausbildungsnachweis.pdf";

    public byte[] generateAusbildungsnachweisPdf(Nachweis nachweis) throws IOException {
        log.info("=== Starting PDF generation for Nachweis ID: {} ===", nachweis.getId());
        log.info("Nachweis Name: {}", nachweis.getName());
        log.info("Activities count: {}", nachweis.getActivities() != null ? nachweis.getActivities().size() : 0);

        ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);
        try (InputStream is = resource.getInputStream(); PDDocument document = PDDocument.load(is)) {
            PDAcroForm form = document.getDocumentCatalog().getAcroForm();
            if (form == null)
                throw new IOException("PDF template has no AcroForm fields");

            // Generate appearances for consistent rendering across all PDF viewers
            // Set NeedAppearances=true to tell viewers to generate appearances from field
            // values
            // This ensures consistent rendering even though we don't have the ArialMT font
            form.setNeedAppearances(true);

            // Fill name and basic fields if present (use exact PDF field names)
            setIfExists(form, "Name", nachweis.getName());
            setIfExists(form, "DatumStart", safeString(nachweis.getDatumStart()));
            setIfExists(form, "DatumEnde", safeString(nachweis.getDatumEnde()));
            setIfExists(form, "Nr", String.valueOf(nachweis.getNummer()));
            setIfExists(form, "Ausbildungsjahr", nachweis.getAusbildungsjahr());
            setIfExists(form, "ListEvery", null);
            setIfExists(form, "Status", safeString(nachweis.getStatus()));

            // Fill activities: map Weekday -> prefix (Mo, Di, Mi, Do, Fr, Sa, So)
            for (Activity a : nachweis.getActivities()) {
                if (a == null)
                    continue;
                String prefix = prefixForDay(a.getDay());
                if (prefix == null || a.getSlot() == null)
                    continue;
                String slot = String.valueOf(a.getSlot());
                // e.g. Mo_1, Mo_Time_1, Mo_Sec_1
                setIfExists(form, prefix + "_" + slot, safeString(a.getDescription()));
                setIfExists(form, prefix + "_Time_" + slot, safeString(a.getHours()));
                setIfExists(form, prefix + "_Sec_" + slot, safeString(a.getSection()));
            }

            // Totals per day (example: Mo_Total)
            BigDecimal grandTotal = BigDecimal.ZERO;
            for (Weekday day : Weekday.values()) {
                BigDecimal total = nachweis.totalForDay(day);
                String prefix = prefixForDay(day);
                if (prefix != null) {
                    setIfExists(form, prefix + "_Total", safeString(total));
                }
                if (total != null)
                    grandTotal = grandTotal.add(total);
            }

            // Gesamtstunden (summe aller Tage)
            setIfExists(form, "Gesamtstunden", safeString(grandTotal));

            // Signatures / meta
            setIfExists(form, "Remark", nachweis.getComment());
            // Ausbilder name
            if (nachweis.getAusbilder() != null) {
                String ausb = nachweis.getAusbilder().getName() != null ? nachweis.getAusbilder().getName()
                        : nachweis.getAusbilder().getUsername();
                setIfExists(form, "Ausbilder", ausb);
            }
            setIfExists(form, "Date_Azubi", safeString(nachweis.getDatumAzubi()));
            setIfExists(form, "Sig_Azubi", safeString(nachweis.getSignaturAzubi()));
            setIfExists(form, "Sig_Ausbilder", safeString(nachweis.getSignaturAusbilder()));

            // Do NOT call refreshAppearances() - it fails with ArialMT font
            // NeedAppearances=true tells the viewer to generate them

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            byte[] pdfBytes = baos.toByteArray();
            log.info("=== PDF generation completed. Size: {} bytes ===", pdfBytes.length);
            return pdfBytes;
        }
    }

    private void setIfExists(PDAcroForm form, String fieldName, Object value) {
        if (value == null) {
            log.debug("PDF Field '{}': Value is null, not setting.", fieldName);
            return;
        }
        PDField field = form.getField(fieldName);
        if (field != null) {
            try {
                // Clear the field first to ensure clean state
                field.setValue("");
                // Set the actual value
                field.setValue(value.toString());
                log.debug("PDF Field '{}' set to '{}'", fieldName, value);
            } catch (IOException e) {
                log.warn("Error setting PDF field '{}' to '{}': {}", fieldName, value, e.getMessage());
            }
        } else {
            log.debug("PDF Field '{}' not found in template.", fieldName);
        }
    }

    private String prefixForDay(Weekday day) {
        if (day == null)
            return null;
        switch (day) {
            case MONDAY:
                return "Mo";
            case TUESDAY:
                return "Tu";
            case WEDNESDAY:
                return "We";
            case THURSDAY:
                return "Th";
            case FRIDAY:
                return "Fr";
            case SATURDAY:
                return "Sa";
            case SUNDAY:
                return "Su";
            default:
                return null;
        }
    }

    private String safeString(Object o) {
        if (o == null)
            return null;
        if (o instanceof BigDecimal)
            return ((BigDecimal) o).toString();
        return o.toString();
    }
}
