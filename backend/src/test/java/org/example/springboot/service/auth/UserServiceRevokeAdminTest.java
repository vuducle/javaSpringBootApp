package org.example.springboot.service.auth;

import org.example.springboot.controller.userController.dto.RevokeAdminResponse;
import org.example.springboot.model.Role;
import org.example.springboot.model.User;
import org.example.springboot.model.enums.ERole;
import org.example.springboot.repository.RoleRepository;
import org.example.springboot.repository.UserRepository;
import org.example.springboot.service.audit.RoleAuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceRevokeAdminTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private RoleAuditService roleAuditService;

    @InjectMocks
    private UserService userService;

    private User adminUser;
    private User trainee1;
    private User trainee2;
    private Role adminRole;
    private Role userRole;

    @BeforeEach
    void setUp() {
        // Setup admin role
        adminRole = new Role();
        adminRole.setName(ERole.ROLE_ADMIN);

        // Setup user role
        userRole = new Role();
        userRole.setName(ERole.ROLE_USER);

        // Setup admin user
        adminUser = new User();
        adminUser.setId(UUID.randomUUID());
        adminUser.setUsername("trainer1");
        adminUser.setName("Trainer One");
        adminUser.setEmail("trainer1@example.com");
        adminUser.setPassword("password");
        adminUser.setRoles(new HashSet<>(Collections.singletonList(adminRole)));

        // Setup trainee 1 assigned to admin
        trainee1 = new User();
        trainee1.setId(UUID.randomUUID());
        trainee1.setUsername("azubi1");
        trainee1.setName("Azubi One");
        trainee1.setEmail("azubi1@example.com");
        trainee1.setPassword("password");
        trainee1.setTrainer(adminUser);
        trainee1.setRoles(new HashSet<>(Collections.singletonList(userRole)));

        // Setup trainee 2 assigned to admin
        trainee2 = new User();
        trainee2.setId(UUID.randomUUID());
        trainee2.setUsername("azubi2");
        trainee2.setName("Azubi Two");
        trainee2.setEmail("azubi2@example.com");
        trainee2.setPassword("password");
        trainee2.setTrainer(adminUser);
        trainee2.setRoles(new HashSet<>(Collections.singletonList(userRole)));
    }

    @Test
    void revokeAdminWithDependents_shouldUnassignTraineesAndRevokeRole() {
        // Given
        List<User> dependents = Arrays.asList(trainee1, trainee2);

        when(userRepository.findByUsername("trainer1")).thenReturn(Optional.of(adminUser));
        when(userRepository.findAllByTrainer(adminUser)).thenReturn(dependents);
        when(roleRepository.findByName(ERole.ROLE_ADMIN)).thenReturn(Optional.of(adminRole));
        when(roleRepository.findByName(ERole.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(userRepository.countByRoles_Name(ERole.ROLE_ADMIN)).thenReturn(2L); // More than 1 admin exists
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.saveAll(anyList())).thenAnswer(i -> i.getArgument(0));

        // When
        RevokeAdminResponse response = userService.revokeAdminRoleFromUserWithDependents(
                "trainer1",
                "system",
                false);

        // Then
        assertNotNull(response);
        assertEquals(2, response.getAffectedTraineesCount());
        assertEquals(2, response.getAffectedTraineeUsernames().size());
        assertTrue(response.getAffectedTraineeUsernames().contains("azubi1"));
        assertTrue(response.getAffectedTraineeUsernames().contains("azubi2"));
        assertTrue(response.getMessage().contains("2 Azubi(s)"));

        // Verify trainees were unassigned
        verify(userRepository).saveAll(dependents);
        assertNull(trainee1.getTrainer());
        assertNull(trainee2.getTrainer());

        // Verify admin role was removed
        verify(userRepository, atLeastOnce()).save(adminUser);
        assertFalse(adminUser.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN));
    }

    @Test
    void revokeAdminWithoutDependents_shouldRevokeRoleOnly() {
        // Given
        when(userRepository.findByUsername("trainer1")).thenReturn(Optional.of(adminUser));
        when(userRepository.findAllByTrainer(adminUser)).thenReturn(Collections.emptyList());
        when(roleRepository.findByName(ERole.ROLE_ADMIN)).thenReturn(Optional.of(adminRole));
        when(roleRepository.findByName(ERole.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(userRepository.countByRoles_Name(ERole.ROLE_ADMIN)).thenReturn(2L);
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        // When
        RevokeAdminResponse response = userService.revokeAdminRoleFromUserWithDependents(
                "trainer1",
                "system",
                false);

        // Then
        assertNotNull(response);
        assertEquals(0, response.getAffectedTraineesCount());
        assertTrue(response.getAffectedTraineeUsernames().isEmpty());
        assertTrue(response.getMessage().contains("erfolgreich entzogen"));

        // Verify no trainees were processed
        verify(userRepository, never()).saveAll(anyList());

        // Verify admin role was removed
        verify(userRepository, atLeastOnce()).save(adminUser);
    }

    @Test
    void revokeAdmin_shouldThrowException_whenUserNotFound() {
        // Given
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(IllegalArgumentException.class,
                () -> userService.revokeAdminRoleFromUserWithDependents("unknown", "system", false));
    }

    @Test
    void revokeAdmin_shouldThrowException_whenLastAdmin() {
        // Given
        when(userRepository.findByUsername("trainer1")).thenReturn(Optional.of(adminUser));
        when(userRepository.findAllByTrainer(adminUser)).thenReturn(Collections.emptyList());
        when(roleRepository.findByName(ERole.ROLE_ADMIN)).thenReturn(Optional.of(adminRole));
        when(userRepository.countByRoles_Name(ERole.ROLE_ADMIN)).thenReturn(1L); // Last admin

        // When & Then
        assertThrows(IllegalStateException.class,
                () -> userService.revokeAdminRoleFromUserWithDependents("trainer1", "system", false));
    }
}
