package org.example.javamusicapp.service;

import org.example.javamusicapp.model.User;
import org.example.javamusicapp.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // HIER ist der Ort des Problems:
        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Benutzer " + username + " wurde nicht gefunden!")
                );
        // Wenn User NICHT UserDetails implementiert, knallt es hier.
    }
}
