package org.example.javamusicapp.service.nachweis;

import lombok.RequiredArgsConstructor;
import org.example.javamusicapp.repository.NachweisRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service("nachweisSecurityService")
@RequiredArgsConstructor
public class NachweisSecurityService {

    private final NachweisRepository nachweisRepository;

    public boolean isOwner(Authentication authentication, UUID nachweisId) {
        String username = authentication.getName();
        return nachweisRepository.findById(nachweisId)
                .map(nachweis -> nachweis.getAzubi().getUsername().equals(username))
                .orElse(false);
    }

    /*
     * Überprüft, ob der aktuell authentifizierte Benutzer ein Ausbilder ist.
     * Ein Benutzer gilt als Ausbilder, wenn sein Benutzername in der
     * Nachweis-Tabelle
     * als Ausbilder-Username existiert.
     */
    public boolean isAusbilder(Authentication authentication) {
        if (authentication == null)
            return false;
        String username = authentication.getName();
        try {
            return nachweisRepository.existsByAusbilderUsername(username);
        } catch (Exception e) {
            return false;
        }
    }
}
