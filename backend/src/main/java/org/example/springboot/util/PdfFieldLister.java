package org.example.springboot.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDNonTerminalField;

import java.io.InputStream;

/**
 * Kleine CLI-Hilfe zum Auflisten der AcroForm-Feldnamen aus der PDF-Vorlage.
 * Run after building the jar: `java -cp
 * build/libs/javaMusicApp-0.0.1-SNAPSHOT.jar
 * org.example.javamusicapp.util.PdfFieldLister`
 */
public class PdfFieldLister {
    private static final String TEMPLATE_PATH = "/static/ausbildungsnachweis.pdf";

    public static void main(String[] args) throws Exception {
        try (InputStream is = PdfFieldLister.class.getResourceAsStream(TEMPLATE_PATH)) {
            if (is == null) {
                System.err.println("Template wurde nicht gefunden auf dem Klassenpfad: " + TEMPLATE_PATH);
                System.exit(2);
            }

            try (PDDocument doc = PDDocument.load(is)) {
                PDAcroForm form = doc.getDocumentCatalog().getAcroForm();
                if (form == null) {
                    System.out.println("Kein AcroForm im PDF-Template gefunden.");
                    return;
                }

                System.out.println("Gefundene PDF-Felder:");
                for (PDField f : form.getFields()) {
                    printFieldRecursive(f, "");
                }
            }
        }
    }

    private static void printFieldRecursive(PDField field, String indent) {
        System.out
                .println(indent + "- " + field.getFullyQualifiedName() + " (" + field.getClass().getSimpleName() + ")");
        if (field instanceof PDNonTerminalField) {
            for (PDField child : ((PDNonTerminalField) field).getChildren()) {
                printFieldRecursive(child, indent + "  ");
            }
        }
    }
}
