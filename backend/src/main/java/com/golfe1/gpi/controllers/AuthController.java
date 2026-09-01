/*

Nom du fichier   : AuthController.java
Objectif         : Endpoints d'authentification - login (pose un cookie httpOnly, refuse les comptes non verifies), register, verification d'email par code, /me (session courante), /logout (efface le cookie)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026
Date de mise à jour : 31/08/2026
Objet de mise à jour : Passage au cookie httpOnly + restauration de la verification d'email obligatoire (verify-email, resend-code) qui avait disparu pendant la reecriture

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.UtilisateurMapper;
import com.golfe1.gpi.dto.request.UtilisateurRequest;
import com.golfe1.gpi.dto.response.UtilisateurResponse;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.security.JwtFilter;
import com.golfe1.gpi.security.JwtUtil;
import com.golfe1.gpi.services.UtilisateurService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UtilisateurService utilisateurService;
    private final UtilisateurMapper utilisateurMapper;

    @Value("${jwt.expiration}")
    private Long jwtExpirationMs;

    @Value("${app.cookie-secure:false}")
    private boolean cookieSecure;

    public AuthController(AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            UtilisateurService utilisateurService,
            UtilisateurMapper utilisateurMapper) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.utilisateurService = utilisateurService;
        this.utilisateurMapper = utilisateurMapper;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> credentials,
            HttpServletResponse response) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        Utilisateur utilisateur = utilisateurService.getParEmail(email);

        if (!Boolean.TRUE.equals(utilisateur.getEmailVerifie())) {
            throw new BusinessRuleException(
                    "Veuillez verifier votre adresse email avant de vous connecter. "
                            + "Un code vous a ete envoye a l'inscription.");
        }

        String token = jwtUtil.generateToken(
                utilisateur.getEmail(),
                utilisateur.getIdUtilisateur(),
                utilisateur.getRole().name());

        ResponseCookie cookie = ResponseCookie.from(JwtFilter.COOKIE_NAME, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(jwtExpirationMs / 1000)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        Map<String, String> body = new HashMap<>();
        body.put("role", utilisateur.getRole().name());
        body.put("nom", utilisateur.getNom() + " " + utilisateur.getPrenom());
        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(JwtFilter.COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur utilisateur = utilisateurService.getParEmail(authentication.getName());

        Map<String, String> body = new HashMap<>();
        body.put("email", utilisateur.getEmail());
        body.put("role", utilisateur.getRole().name());
        body.put("nom", utilisateur.getNom() + " " + utilisateur.getPrenom());
        return ResponseEntity.ok(body);
    }

    @PostMapping("/register")
    public ResponseEntity<UtilisateurResponse> register(@Valid @RequestBody UtilisateurRequest request) {
        Utilisateur utilisateur = utilisateurService.creerUtilisateur(
                request.getNom(),
                request.getPrenom(),
                request.getEmail(),
                request.getMotDePasse(),
                request.getRole());

        UtilisateurResponse response = utilisateurMapper.toResponse(utilisateur);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");

        utilisateurService.verifierEmail(email, code);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Email verifie avec succes. Vous pouvez maintenant vous connecter.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-code")
    public ResponseEntity<Map<String, String>> resendCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");

        utilisateurService.renvoyerCodeVerification(email);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Un nouveau code a ete envoye.");
        return ResponseEntity.ok(response);
    }
}