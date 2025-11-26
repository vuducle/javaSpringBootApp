package org.example.javamusicapp.service.nachweis;

import org.example.javamusicapp.model.Nachweis;
import org.example.javamusicapp.model.User;
import org.example.javamusicapp.model.enums.EStatus;
import org.example.javamusicapp.repository.NachweisRepository;
import org.example.javamusicapp.service.auth.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NachweisServiceTest {

    @Mock
    NachweisRepository nachweisRepository;

    @Mock
    UserService userService;

    @Mock
    org.example.javamusicapp.repository.UserRepository userRepository;

    @Mock
    EmailService emailService;

    @Mock
    PdfExportService pdfExportService;

    @InjectMocks
    NachweisService nachweisService;

    Path root = Paths.get("generated_pdfs");

    @BeforeEach
    void setUp() throws Exception {
        Files.createDirectories(root);
    }

    @AfterEach
    void tearDown() throws Exception {
        // attempt to clean up any files we created under generated_pdfs
        if (Files.exists(root)) {
            Files.walk(root)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(p -> {
                        try {
                            Files.deleteIfExists(p);
                        } catch (Exception ignored) {
                        }
                    });
        }
    }

    @Test
    void updateNachweisStatus_whenAccepted_attachesPdfIfPresent() throws Exception {
        UUID nachweisId = UUID.randomUUID();
        UUID azubiId = UUID.randomUUID();

        User azubi = new User();
        azubi.setId(azubiId);
        azubi.setName("Cloud Strife");
        azubi.setEmail("azubi@example.com");

        User ausbilder = new User();
        ausbilder.setId(UUID.randomUUID());
        ausbilder.setName("Ausbilder Max Mustermann");
        ausbilder.setEmail("ausbilder@example.com");

        Nachweis nachweis = new Nachweis();
        nachweis.setId(nachweisId);
        nachweis.setAzubi(azubi);
        nachweis.setAusbilder(ausbilder);
        nachweis.setNummer(42);

        when(nachweisRepository.findById(nachweisId)).thenReturn(Optional.of(nachweis));
        when(nachweisRepository.save(any())).thenReturn(nachweis);

        // create the expected PDF file so the service will attach it
        String userVollerName = azubi.getName().toLowerCase().replaceAll(" ", "_");
        Path userDir = root.resolve(userVollerName + "_" + azubiId.toString());
        Files.createDirectories(userDir);
        Path pdfFile = userDir.resolve(nachweisId.toString() + ".pdf");
        Files.write(pdfFile, new byte[] { 1, 2, 3 });

        nachweisService.updateNachweisStatus(nachweisId, EStatus.ANGENOMMEN, "Alles gut");

        verify(emailService, times(1)).sendEmailWithAttachment(eq(azubi.getEmail()), anyString(), anyString(),
                any(byte[].class), anyString(), eq("application/pdf"));
    }

    @Test
    void updateNachweisStatus_whenNotAccepted_sendsSimpleEmail() {
        UUID nachweisId = UUID.randomUUID();
        UUID azubiId = UUID.randomUUID();

        User azubi = new User();
        azubi.setId(azubiId);
        azubi.setName("Julia Nguyen");
        azubi.setEmail("julianguyen@example.com");

        User ausbilder = new User();
        ausbilder.setId(UUID.randomUUID());
        ausbilder.setName("Armin Dorri");

        Nachweis nachweis = new Nachweis();
        nachweis.setId(nachweisId);
        nachweis.setAzubi(azubi);
        nachweis.setAusbilder(ausbilder);
        nachweis.setNummer(99);

        when(nachweisRepository.findById(nachweisId)).thenReturn(Optional.of(nachweis));
        when(nachweisRepository.save(any())).thenReturn(nachweis);

        nachweisService.updateNachweisStatus(nachweisId, EStatus.IN_BEARBEITUNG, "Bitte prüfen");

        verify(emailService, times(1)).sendEmail(eq(azubi.getEmail()), anyString(), anyString());
    }
}
