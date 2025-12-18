package org.example.springboot.service.auth;

import lombok.extern.slf4j.Slf4j;
import org.example.springboot.controller.userController.dto.RevokeAdminResponse;
import org.example.springboot.controller.userController.dto.UserUpdateRequest;
import org.example.springboot.model.User;
import org.example.springboot.repository.specification.UserSpecification;
import org.example.springboot.service.audit.RoleAuditService;
import org.example.springboot.repository.UserRepository;
import org.example.springboot.repository.RoleRepository;
import org.example.springboot.model.Role;
import org.example.springboot.model.enums.ERole;
import org.example.springboot.service.nachweis.NachweisService;
import org.example.springboot.service.nachweis.EmailService;
import org.example.springboot.model.EmailVerificationToken;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.UUID;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 👑 **Was geht hier ab?**
 * Das ist der absolute Endgegner-Service für alles, was mit Usern zu tun hat.
 * Er ist das Gehirn für die User-Verwaltung und arbeitet eng mit Spring
 * Security zusammen.
 *
 * Seine Superkräfte im Überblick:
 * - **UserDetailsService-Implementierung**: Holt die User-Daten für Spring
 * Security,
 * damit der Login und die Rechteprüfung klappen. Hier wird die E-Mail als
 * "Username"
 * für den Login verwendet.
 * - **Passwort-Management**: Beinhaltet die Logik zum Ändern des eigenen
 * Passworts und zum
 * Zurücksetzen, wenn man es mal vergessen hat. Alles natürlich safe mit
 * Hashing.
 * - **Profil-Updates**: Managed das Aktualisieren von User-Infos wie Name,
 * Azubi-Jahr etc.
 * - **Profilbild-Upload**: Richtig krasser Stuff hier. Nimmt ein Bild, checkt
 * es,
 * skaliert es auf eine vernünftige Größe, optimiert es und versucht, es als
 * modernes
 * WebP zu speichern. Wenn das nicht geht, gibt's ein JPEG als Fallback. Löscht
 * auch alte Bilder.
 * - **Admin-Aktionen**: Beinhaltet die Logik, um Usern Admin-Rechte zu geben
 * oder zu entziehen.
 * Das wird natürlich alles im `RoleAuditService` protokolliert.
 * - **User löschen**: Eine kritische Methode, die einen User nicht nur aus der
 * DB löscht,
 * sondern auch all seine zugehörigen Daten wie Nachweise und das Profilbild
 * entfernt.
 */
@Slf4j
@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final RoleAuditService roleAuditService;
    private final NachweisService nachweisService;
    private final EmailService emailService;
    private final EmailVerificationTokenService verificationTokenService;
    private static final String UPLOAD_DIR = "uploads/profile-images/";
    @Value("${image.max-width:1024}")
    private int maxWidth;

    @Value("${image.max-height:1024}")
    private int maxHeight;

    @Value("${image.quality:0.75}")
    private float imageQuality;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, RoleRepository roleRepository,
            RoleAuditService roleAuditService, @Lazy NachweisService nachweisService,
            EmailService emailService, EmailVerificationTokenService verificationTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.roleAuditService = roleAuditService;
        this.nachweisService = nachweisService;
        this.emailService = emailService;
        this.verificationTokenService = verificationTokenService;
        // Erstelle das Upload-Verzeichnis, falls es nicht existiert
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            log.error("Fehler beim Erstellen des Upload-Verzeichnisses: {}", e.getMessage());
        }
    }

    @Transactional
    public void deleteUser(String username, String performedBy) {
        User user = findByUsername(username);

        log.info("AUDIT: Benutzer '{}' wird von '{}' gelöscht.", username, performedBy);

        // Delete Nachweise
        try {
            nachweisService.loescheAlleNachweiseVonAzubi(username);
            log.info("Alle Nachweise für Benutzer '{}' gelöscht.", username);
        } catch (Exception e) {
            log.error("Konnte Nachweise für Benutzer '{}' nicht vollständig löschen: {}", username, e.getMessage());
        }

        // Delete Profile Image
        try {
            deleteProfileImage(username);
            log.info("Profilbild für Benutzer '{}' gelöscht.", username);
        } catch (IOException e) {
            log.error("Konnte Profilbild für Benutzer '{}' nicht löschen: {}", username, e.getMessage());
        }

        userRepository.delete(user);
        log.info("Benutzer '{}' erfolgreich aus der Datenbank gelöscht.", username);
    }

    public void grantAdminRoleToUser(String targetUsername) {
        grantAdminRoleToUser(targetUsername, "system");
    }

    // ... (rest of the file remains the same)
    // ...
    public void grantAdminRoleToUser(String targetUsername, String performedBy) {
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new IllegalArgumentException("Zielbenutzer nicht gefunden: " + targetUsername));

        // Prüfe, ob Ziel bereits Admin ist
        boolean alreadyAdmin = target.getRoles().stream()
                .anyMatch(r -> r.getName() == ERole.ROLE_ADMIN);
        if (alreadyAdmin) {
            log.info("Benutzer {} hat bereits ROLE_ADMIN", targetUsername);
            return;
        }

        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN ist nicht konfiguriert"));

        // Finde die ROLE_USER
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new IllegalStateException("ROLE_USER ist nicht konfiguriert"));

        // Entferne ROLE_USER, falls vorhanden
        target.getRoles().remove(userRole);

        target.getRoles().add(adminRole);
        userRepository.save(target);
        log.info("ROLE_ADMIN zugewiesen an User: {}", targetUsername);
        try {
            roleAuditService.record("GRANT", targetUsername, performedBy, "Assigned ROLE_ADMIN");
        } catch (Exception e) {
            log.warn("Audit-Eintrag konnte nicht geschrieben werden: {}", e.getMessage());
        }
    }

    public void revokeAdminRoleFromUser(String targetUsername) {
        revokeAdminRoleFromUser(targetUsername, "system");
    }

    public void revokeAdminRoleFromUser(String targetUsername, String performedBy) {
        // backwards-compatible: keepAsNoRole = false (assign ROLE_USER if missing)
        revokeAdminRoleFromUser(targetUsername, performedBy, false);
    }

    /**
     * Revoke ROLE_ADMIN from a user.
     *
     * @param targetUsername target user
     * @param performedBy    who performed the action (for audit)
     * @param keepAsNoRole   if true, do not auto-assign ROLE_USER after revoke; if
     *                       false, assign ROLE_USER when missing
     */
    public void revokeAdminRoleFromUser(String targetUsername, String performedBy, boolean keepAsNoRole) {
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new IllegalArgumentException("Zielbenutzer nicht gefunden: " + targetUsername));

        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN ist nicht konfiguriert"));

        boolean hasAdmin = target.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN);
        if (!hasAdmin) {
            log.info("User {} hatte ROLE_ADMIN nicht", targetUsername);
            return;
        }

        long adminCount = userRepository.countByRoles_Name(ERole.ROLE_ADMIN);
        if (adminCount <= 1) {
            // Prevent removing the last remaining admin
            throw new IllegalStateException("Entfernen nicht möglich: Es muss mindestens ein Admin-Account bestehen");
        }

        boolean removed = target.getRoles().removeIf(r -> r.getName() == ERole.ROLE_ADMIN);
        if (removed) {
            userRepository.save(target);
            log.info("ROLE_ADMIN entfernt von User: {}", targetUsername);
            try {
                roleAuditService.record("REVOKE", targetUsername, performedBy, "Removed ROLE_ADMIN");
            } catch (Exception e) {
                log.warn("Audit-Eintrag konnte nicht geschrieben werden: {}", e.getMessage());
            }

            if (!keepAsNoRole) {
                // Wenn der User danach keine ROLE_USER hat, setzen wir ihn als Azubi
                // (ROLE_USER).
                boolean hasUserRole = target.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_USER);
                if (!hasUserRole) {
                    try {
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new IllegalStateException("ROLE_USER ist nicht konfiguriert"));
                        target.getRoles().add(userRole);
                        userRepository.save(target);
                        log.info("ROLE_USER automatisch zugewiesen an User: {} (nach Entzug von ADMIN)",
                                targetUsername);
                        try {
                            roleAuditService.record("GRANT", targetUsername, performedBy,
                                    "Assigned ROLE_USER after ADMIN revoke");
                        } catch (Exception e) {
                            log.warn("Audit-Eintrag konnte nicht geschrieben werden: {}", e.getMessage());
                        }
                    } catch (Exception e) {
                        log.warn("Konnte ROLE_USER nicht automatisch zuweisen: {}", e.getMessage());
                    }
                }
            } else {
                log.info("keepAsNoRole=true: keine automatische Zuweisung von ROLE_USER für {}", targetUsername);
            }
        }
    }

    /**
     * Revoke ROLE_ADMIN from a user and handle dependent trainees.
     * 
     * @param targetUsername target user whose admin role will be revoked
     * @param performedBy    who performed the action (for audit)
     * @param keepAsNoRole   if true, do not auto-assign ROLE_USER after revoke
     * @return RevokeAdminResponse with count and list of affected trainees
     */
    @Transactional
    public RevokeAdminResponse revokeAdminRoleFromUserWithDependents(String targetUsername, String performedBy,
            boolean keepAsNoRole) {
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new IllegalArgumentException("Zielbenutzer nicht gefunden: " + targetUsername));

        // Find all trainees assigned to this trainer (team field contains user ID as
        // string)
        String targetId = target.getId().toString();
        List<User> dependentTrainees = userRepository.findAllByTrainer(target);

        // Unassign all dependent trainees (set trainer to null)
        if (!dependentTrainees.isEmpty()) {
            dependentTrainees.forEach(trainee -> {
                trainee.setTrainer(null);
                log.info("Unassigned trainee {} from trainer {}", trainee.getUsername(), targetUsername);
            });
            userRepository.saveAll(dependentTrainees);
        }

        // Now revoke admin role using existing logic
        revokeAdminRoleFromUser(targetUsername, performedBy, keepAsNoRole);

        // Build response
        List<String> affectedUsernames = dependentTrainees.stream()
                .map(User::getUsername)
                .toList();

        String message = dependentTrainees.isEmpty()
                ? "ROLE_ADMIN erfolgreich entzogen von " + targetUsername
                : String.format("ROLE_ADMIN erfolgreich entzogen von %s. %d Azubi(s) wurden automatisch entfernt.",
                        targetUsername, dependentTrainees.size());

        return new RevokeAdminResponse(message, dependentTrainees.size(), affectedUsernames);
    }

    public List<User> listAdmins() {
        return userRepository.findAllByRoles_Name(ERole.ROLE_ADMIN);
    }

    public List<User> listAusbilder() {
        // Return all users who have ROLE_ADMIN or have nachweiseAlsAusbilder
        // For simplicity, we'll return all users with ROLE_ADMIN
        // If you have a specific "AUSBILDER" group/role, adjust accordingly
        return userRepository.findAllByRoles_Name(ERole.ROLE_ADMIN);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Page<User> findAllWithFilters(String search, String team, Integer ausbildungsjahr, String rolle,
            Pageable pageable) {
        Specification<User> spec = Specification
                .where(UserSpecification.searchByTerm(search))
                .and(UserSpecification.hasTeam(team))
                .and(UserSpecification
                        .hasAusbildungsjahr(ausbildungsjahr))
                .and(UserSpecification.hasRole(rolle));
        return userRepository.findAll(spec, pageable);
    }

    public List<String> listUsernamesByRole(ERole role) {
        return userRepository.findAllByRoles_Name(role).stream().map(User::getUsername).collect(Collectors.toList());
    }

    public boolean isAdmin(String username) {
        try {
            User user = findByUsername(username);
            return user.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // The "username" parameter is treated as the email for authentication purposes
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer mit E-Mail nicht gefunden: " + username));
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = findByUsername(username);

        // Überprüfe, ob das alte Passwort korrekt ist
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Altes Passwort ist nicht korrekt");
        }

        // Setze das neue Passwort
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("AUDIT: Passwort wurde vom Benutzer '{}' geändert.", username);
    }

    public void resetPassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("AUDIT: Passwort für Benutzer '{}' wurde über die Passwort-zurücksetzen-Funktion geändert.",
                user.getUsername());
    }

    public User updateUserProfile(String username,
            UserUpdateRequest request) {
        User user = findByUsername(username);

        // Update name if provided
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }

        // Update email if provided and check for uniqueness
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (!request.getEmail().equals(user.getEmail())) {
                if (userRepository.existsByEmail(request.getEmail())) {
                    throw new IllegalArgumentException("Email ist bereits vergeben");
                }
                user.setEmail(request.getEmail());
            }
        }

        // Update username if provided and check for uniqueness
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            if (!request.getUsername().equals(user.getUsername())) {
                if (userRepository.existsByUsername(request.getUsername())) {
                    throw new IllegalArgumentException("Benutzername ist bereits vergeben");
                }
                user.setUsername(request.getUsername());
            }
        }

        // Update other fields
        if (request.getAusbildungsjahr() != null) {
            user.setAusbildungsjahr(request.getAusbildungsjahr());
        }
        if (request.getTelefonnummer() != null) {
            user.setTelefonnummer(request.getTelefonnummer());
        }
        if (request.getTrainerId() != null) {
            User trainer = userRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new IllegalArgumentException("Trainer nicht gefunden"));
            user.setTrainer(trainer);
        }

        return userRepository.save(user);
    }

    public User updateUserProfileByAdmin(String username,
            UserUpdateRequest request) {
        User user = findByUsername(username);

        // Update name if provided
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }

        // Update email if provided and check for uniqueness
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (!request.getEmail().equals(user.getEmail())) {
                if (userRepository.existsByEmail(request.getEmail())) {
                    throw new IllegalArgumentException("Email ist bereits vergeben");
                }
                user.setEmail(request.getEmail());
            }
        }

        // Update username if provided and check for uniqueness
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            if (!request.getUsername().equals(user.getUsername())) {
                if (userRepository.existsByUsername(request.getUsername())) {
                    throw new IllegalArgumentException("Benutzername ist bereits vergeben");
                }
                user.setUsername(request.getUsername());
            }
        }

        // Update other fields
        if (request.getAusbildungsjahr() != null) {
            user.setAusbildungsjahr(request.getAusbildungsjahr());
        }
        if (request.getTelefonnummer() != null) {
            user.setTelefonnummer(request.getTelefonnummer());
        }
        if (request.getTrainerId() != null) {
            User trainer = userRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new IllegalArgumentException("Trainer nicht gefunden"));
            user.setTrainer(trainer);
        }

        return userRepository.save(user);
    }

    /*
     * Lädt ein Profilbild für den angegebenen User hoch, skaliert es bei Bedarf und
     * speichert es im Dateisystem.
     * Unterstützt JPEG-Formate. Löscht das alte Profilbild
     */
    public User uploadProfileImage(String username, MultipartFile file) throws IOException {
        User user = findByUsername(username);

        // Validierung
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Datei ist leer");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Nur Bilddateien sind erlaubt");
        }

        // Lese Rohdaten (damit wir ggf. das Original unverändert speichern können)
        byte[] inputBytes = file.getBytes();
        // Lese Bild aus den Bytes
        BufferedImage image = ImageIO.read(new java.io.ByteArrayInputStream(inputBytes));
        if (image == null) {
            throw new IllegalArgumentException("Die Datei ist kein lesbares Bild");
        }

        // Resize: falls das Bild größer als erlaubt, skaliere proportional
        int origW = image.getWidth();
        int origH = image.getHeight();
        double scale = Math.min(1d, Math.min((double) maxWidth / origW, (double) maxHeight / origH));
        if (scale < 1d) {
            int targetW = (int) Math.round(origW * scale);
            int targetH = (int) Math.round(origH * scale);
            BufferedImage resized = new BufferedImage(targetW, targetH, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2 = resized.createGraphics();
            g2.setComposite(AlphaComposite.SrcOver);
            g2.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g2.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            // If source has alpha, paint white background first
            if (image.getColorModel().hasAlpha()) {
                g2.setColor(Color.WHITE);
                g2.fillRect(0, 0, targetW, targetH);
            }
            g2.drawImage(image, 0, 0, targetW, targetH, null);
            g2.dispose();
            image = resized;
        } else {
            // Wenn das Bild Alpha hat, konvertiere zu RGB mit weißem Hintergrund
            if (image.getColorModel().hasAlpha() && image.getType() != BufferedImage.TYPE_INT_RGB) {
                BufferedImage converted = new BufferedImage(image.getWidth(), image.getHeight(),
                        BufferedImage.TYPE_INT_RGB);
                Graphics2D g = converted.createGraphics();
                g.setComposite(AlphaComposite.SrcOver);
                g.setColor(Color.WHITE);
                g.fillRect(0, 0, image.getWidth(), image.getHeight());
                g.drawImage(image, 0, 0, null);
                g.dispose();
                image = converted;
            }
        }

        // Bestimme Original-Extension (ohne Punkt)
        String originalFilename = file.getOriginalFilename();
        String originalExt = null;
        if (originalFilename != null && originalFilename.contains(".")) {
            originalExt = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
        }

        // Stelle sicher, dass ImageIO-Plugins geladen sind (z.B. TwelveMonkeys)
        try {
            javax.imageio.ImageIO.scanForPlugins();
        } catch (Throwable t) {
            log.debug("Fehler beim Scannen von ImageIO-Plugins: {}", t.getMessage());
        }

        // Versuche WebP (unter verschiedenen Format-/MIME-Namen), sonst fallback auf
        // JPEG
        String[] webpNames = new String[] { "webp", "WEBP", "WebP" };
        Iterator<ImageWriter> writers = null;
        for (String name : webpNames) {
            writers = ImageIO.getImageWritersByFormatName(name);
            if (writers.hasNext())
                break;
            writers = ImageIO.getImageWritersByMIMEType("image/" + name.toLowerCase());
            if (writers.hasNext())
                break;
        }

        String newFilename;
        Path targetPath;
        if (writers != null && writers.hasNext()) {
            newFilename = user.getId() + "_" + UUID.randomUUID() + ".webp";
            targetPath = Paths.get(UPLOAD_DIR + newFilename);
            ImageWriter writer = writers.next();
            try (ImageOutputStream ios = ImageIO.createImageOutputStream(targetPath.toFile())) {
                writer.setOutput(ios);
                ImageWriteParam param = writer.getDefaultWriteParam();
                if (param.canWriteCompressed()) {
                    param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                    param.setCompressionQuality(imageQuality);
                }
                writer.write(null, new IIOImage(image, null, null), param);
            } finally {
                writer.dispose();
            }
            log.info("Profilbild gespeichert als WebP: {}", newFilename);
        } else {
            // Log available writer formats for debugging
            try {
                String[] available = ImageIO.getWriterFormatNames();
                log.info("Keine WebP-Writer gefunden. Verfügbare ImageIO-Writer: {}", String.join(",", available));
            } catch (Throwable t) {
                log.debug("Fehler beim Abfragen verfügbarer Writer: {}", t.getMessage());
            }
            // Fallback: schreibe als JPEG
            // If original was WebP and we don't have a WebP writer, save original bytes as
            // .webp
            if ("webp".equals(originalExt)) {
                newFilename = user.getId() + "_" + UUID.randomUUID() + ".webp";
                targetPath = Paths.get(UPLOAD_DIR + newFilename);
                try {
                    Files.write(targetPath, inputBytes);
                    log.info(
                            "Original WebP-Datei gespeichert (keine WebP-Writer verfügbar, Originalbytes verwendet): {}",
                            newFilename);
                } catch (IOException e) {
                    log.error("Fehler beim Speichern der Original-WebP-Datei: {}", e.getMessage());
                    throw e;
                }
            } else {
                newFilename = user.getId() + "_" + UUID.randomUUID() + ".jpg";
                targetPath = Paths.get(UPLOAD_DIR + newFilename);
                Iterator<ImageWriter> jpgWriters = ImageIO.getImageWritersByFormatName("jpg");
                if (!jpgWriters.hasNext()) {
                    ImageIO.write(image, "jpg", targetPath.toFile());
                } else {
                    ImageWriter writer = jpgWriters.next();
                    try (ImageOutputStream ios = ImageIO.createImageOutputStream(targetPath.toFile())) {
                        writer.setOutput(ios);
                        ImageWriteParam param = writer.getDefaultWriteParam();
                        if (param.canWriteCompressed()) {
                            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                            param.setCompressionQuality(imageQuality);
                        }
                        writer.write(null, new IIOImage(image, null, null), param);
                    } finally {
                        writer.dispose();
                    }
                }
                log.info("Profilbild gespeichert als JPEG (WebP-Writer nicht verfügbar): {}", newFilename);
            }
        }

        // Lösche das alte Bild, falls vorhanden
        if (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isEmpty()) {
            try {
                String oldFilename = user.getProfileImageUrl()
                        .substring(user.getProfileImageUrl().lastIndexOf("/") + 1);
                Path oldPath = Paths.get(UPLOAD_DIR + oldFilename);
                Files.deleteIfExists(oldPath);
            } catch (Exception e) {
                log.warn("Fehler beim Löschen des alten Profilbilds: {}", e.getMessage());
            }
        }

        // Update den User
        user.setProfileImageUrl("/uploads/profile-images/" + newFilename);
        User savedUser = userRepository.save(user);
        log.info("Profilbild hochgeladen für User: {}", username);

        return savedUser;
    }

    public User deleteProfileImage(String username) throws IOException {
        User user = findByUsername(username);

        // Lösche das Bild aus dem Dateisystem, falls vorhanden
        if (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isEmpty()) {
            try {
                String filename = user.getProfileImageUrl()
                        .substring(user.getProfileImageUrl().lastIndexOf("/") + 1);
                Path filePath = Paths.get(UPLOAD_DIR + filename);
                Files.deleteIfExists(filePath);
                log.info("Profilbild-Datei gelöscht: {}", filename);
            } catch (Exception e) {
                log.error("Fehler beim Löschen der Profilbild-Datei: {}", e.getMessage());
                throw new IOException("Fehler beim Löschen der Profilbild-Datei", e);
            }
        }

        // Setze die URL auf null
        user.setProfileImageUrl(null);
        User savedUser = userRepository.save(user);
        log.info("Profilbild-URL entfernt für User: {}", username);

        return savedUser;
    }

    /**
     * Sendet eine Verifizierungs-E-Mail an den User
     */
    @Transactional
    public void sendVerificationEmail(User user) {
        EmailVerificationToken token = verificationTokenService.createVerificationToken(user);
        String verificationLink = frontendUrl + "/verify-email?token=" + token.getToken();
        emailService.sendEmailVerification(user.getEmail(), user.getName(), verificationLink);
        log.info("Verification email sent to user: {}", user.getEmail());
    }

    /**
     * Verifiziert die E-Mail-Adresse eines Users
     */
    @Transactional
    public void verifyEmail(String token) {
        Optional<User> userOptional = verificationTokenService.validateToken(token);

        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("Ungültiger oder abgelaufener Verifizierungs-Token");
        }

        User user = userOptional.get();
        user.setEmailVerified(true);
        userRepository.save(user);

        verificationTokenService.markTokenAsUsed(token);
        log.info("Email verified for user: {}", user.getEmail());
    }

    /**
     * Sendet erneut eine Verifizierungs-E-Mail
     */
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User nicht gefunden"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("E-Mail-Adresse ist bereits verifiziert");
        }

        sendVerificationEmail(user);
    }
}
