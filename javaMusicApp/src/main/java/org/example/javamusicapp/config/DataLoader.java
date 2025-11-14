package org.example.javamusicapp.config;

import org.example.javamusicapp.model.Role;
import org.example.javamusicapp.model.User;
import org.example.javamusicapp.model.enums.ERole;
import org.example.javamusicapp.repository.RoleRepository;
import org.example.javamusicapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
public class DataLoader implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private void seedRoles() {
        for (ERole roleName : ERole.values()) {
            Optional<Role> existingRole = roleRepository.findByName(roleName);
            if (existingRole.isEmpty()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
                DataLoader.log.info("Rolle erstellt: " + roleName);
            }
        }
    }

    // -- Admin User Seeding --
    private void seedAdminUser() {
        if (userRepository.findByUsername("triesnhaameilya").isEmpty()) {

            // 1. Hole die ROLE_ADMIN-Rolle
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Rolle nicht gefunden: ADMIN"));

            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);

            // 2. Admin User erstellen
            User admin = new User();
            admin.setUsername("triesnhaameilya");
            admin.setEmail("triesnhaameilya@lyrics.app");
            // WICHTIG: Passwort HASCHEN!
            admin.setPassword(passwordEncoder.encode("SecureAdminPassword123!"));
            admin.setRoles(roles);

            userRepository.save(admin);
            DataLoader.log.info("Admin-Benutzer 'admin' erfolgreich erstellt und gespeichert.");
        }
    }

    // -- Normal User Seeding --
    private void seedNormalUser() {
        if (userRepository.findByUsername("vergildmc5").isEmpty()) {

            // 1. Hole die ROLE_USER-Rolle
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Rolle nicht gefunden: USER"));

            Set<Role> roles = new HashSet<>();
            roles.add(userRole);

            // 2. Normal User erstellen
            User user = new User();
            user.setUsername("vergildmc5");
            user.setEmail("vergildmc5@lyrics.app");
            user.setPassword(passwordEncoder.encode("SecureUserPassword123!"));
            user.setRoles(roles);

            userRepository.save(user);
            DataLoader.log.info("Normal-Benutzer 'user' erfolgreich erstellt und gespeichert.");
        }
    }

    @Override
    public void run(String... args) throws Exception {
        seedRoles();
        seedAdminUser();
        seedNormalUser();
    }
}
