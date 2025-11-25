package org.example.javamusicapp.controller;

import org.example.javamusicapp.model.Nachweis;
import org.example.javamusicapp.repository.NachweisRepository;
import org.example.javamusicapp.service.PdfExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/pdf")
public class PdfController {

    private final NachweisRepository nachweisRepository;
    private final PdfExportService pdfExportService;

    public PdfController(NachweisRepository nachweisRepository, PdfExportService pdfExportService) {
        this.nachweisRepository = nachweisRepository;
        this.pdfExportService = pdfExportService;
    }

    @GetMapping(value = "/nachweis/{id}")
    public ResponseEntity<byte[]> getNachweisPdf(@PathVariable("id") UUID id) {
        Optional<Nachweis> o = nachweisRepository.findById(id);
        if (o.isEmpty())
            return ResponseEntity.notFound().build();
        Nachweis n = o.get();
        try {
            byte[] pdf = pdfExportService.generateAusbildungsnachweisPdf(n);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "nachweis-" + id + ".pdf");
            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
