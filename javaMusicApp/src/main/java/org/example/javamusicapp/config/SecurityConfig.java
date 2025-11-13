package org.example.javamusicapp.config;

import jakarta.servlet.Filter;
import org.example.javamusicapp.auth.JwtAuthEntryPoint;
import org.example.javamusicapp.auth.JwtAuthenticationFilter;
import org.example.javamusicapp.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private static final String[] PUBLIC_URLS = {
            "/api/auth/**",      // Registrierung und Login
            "/v3/api-docs/**",   // OpenAPI Spezifikation JSON
            "/swagger-ui/**",    // Swagger UI
            "/swagger-ui.html"
    };
    // Platzhalter für den UserService und JWT Filter
    private final JwtAuthEntryPoint unauthorizedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final UserDetailsService userDetailsService;
    public SecurityConfig(
            JwtAuthEntryPoint unauthorizedHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            UserDetailsService userDetailsService
    ) {
        this.unauthorizedHandler = unauthorizedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http)  throws Exception {

        http.csrf(AbstractHttpConfigurer::disable)
        // Da wir Java lieben, immer verbose schreiben, Ja!
        // Sollte Stateless sein
        .sessionManagement(session -> session.sessionCreationPolicy(
                SessionCreationPolicy.STATELESS
        ))
        .authorizeHttpRequests(req -> req.requestMatchers(PUBLIC_URLS)
                .permitAll()
                .anyRequest()
                .authenticated())
        .exceptionHandling(exc ->exc.authenticationEntryPoint(unauthorizedHandler))
        .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );


        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Speichert Passwörter und verschlüsselt z.B "JuliaNguyenVSTriesnhaAmeilya123@" in ein Hash
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        // Ist für Login wichtig
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        // Implementierung des Providers, der UserService und PasswordEncoder kombiniert
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService); // UserDetailsService (dein UserService)
        authProvider.setPasswordEncoder(passwordEncoder()); // PasswordEncoder (die Bean)
        return authProvider;
    }
}
