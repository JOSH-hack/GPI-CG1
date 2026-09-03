/*

Nom du fichier   : SecurityConfig.java
Objectif         : Configuration Spring Security - CORS, CSRF, routes, filtres JWT
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026
Date de mise à jour : 03/09/2026
Objet de mise à jour : Ajout d'une RoleHierarchy - ADMIN_SYSTEME (super admin) herite
                        desormais automatiquement de toutes les permissions des autres
                        roles pour chaque @PreAuthorize existant et futur, sans avoir a
                        modifier chaque controleur individuellement (voir aussi
                        RoleRoute.jsx cote frontend, qui applique la meme regle).

*/

package com.golfe1.gpi.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CustomUserDetailsService customUserDetailsService;

    // Liste d'origines autorisées, separees par des virgules (ex:
    // http://localhost:5173,https://gpi.golfe1.tg)
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(JwtFilter jwtFilter, CustomUserDetailsService customUserDetailsService) {
        this.jwtFilter = jwtFilter;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource)
            throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/logout",
                                "/api/auth/verify-email", "/api/auth/resend-code")
                        .permitAll()
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/api/dashboard/**").authenticated()
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ADMIN_SYSTEME est le super admin de l'application : il doit pouvoir faire
    // absolument tout ce que n'importe quel autre role peut faire. Plutot que
    // d'ajouter "or hasRole('ADMIN_SYSTEME')" a chaque @PreAuthorize existant
    // (fragile - on oubliera forcement un endpoint, comme on l'a deja constate
    // avec Categories/Agents/Interventions cote frontend), on declare une
    // hierarchie : ADMIN_SYSTEME herite de TOUS les autres roles. Un
    // @PreAuthorize("hasRole('TECHNICIEN')") existant autorise donc desormais
    // aussi ADMIN_SYSTEME automatiquement, y compris sur les controleurs qui
    // seront ecrits plus tard.
    @Bean
    public RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.fromHierarchy("""
                ROLE_ADMIN_SYSTEME > ROLE_ADMIN_INFO
                ROLE_ADMIN_SYSTEME > ROLE_RESPONSABLE_DSI
                ROLE_ADMIN_SYSTEME > ROLE_TECHNICIEN
                ROLE_ADMIN_SYSTEME > ROLE_AGENT
                """);
    }

    // Necessaire pour que @PreAuthorize/@PostAuthorize (methode-level security)
    // prennent reellement en compte la RoleHierarchy ci-dessus - sans ce bean,
    // la hierarchie serait ignoree par hasRole(...) dans les annotations.
    @Bean
    public MethodSecurityExpressionHandler methodSecurityExpressionHandler(RoleHierarchy roleHierarchy) {
        DefaultMethodSecurityExpressionHandler expressionHandler = new DefaultMethodSecurityExpressionHandler();
        expressionHandler.setRoleHierarchy(roleHierarchy);
        return expressionHandler;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}