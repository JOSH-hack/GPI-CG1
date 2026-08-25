/*

Nom du fichier   : AuthController.java
Objectif         : Endpoints d'authentification - login et enregistrement
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.request.UtilisateurRequest;
import com.golfe1.gpi.dto.response.UtilisateurResponse;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.security.JwtUtil;
import com.golfe1.gpi.services.UtilisateurService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UtilisateurService utilisateurService;

    public AuthController(AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            UtilisateurService utilisateurService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.utilisateurService = utilisateurService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        Utilisateur utilisateur = utilisateurService.getParEmail(email);
        String token = jwtUtil.generateToken(
                utilisateur.getEmail(),
                utilisateur.getIdUtilisateur(),
                utilisateur.getRole().name());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", utilisateur.getRole().name());
        response.put("nom", utilisateur.getNom() + " " + utilisateur.getPrenom());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UtilisateurResponse> register(@RequestBody UtilisateurRequest request) {
        Utilisateur utilisateur = utilisateurService.creerUtilisateur(
                request.getNom(),
                request.getPrenom(),
                request.getEmail(),
                request.getMotDePasse(),
                request.getRole());

        // On devrais retourner un DTO, mais pour l'instant on retourne l'entité
        // (à mapper plus tard quand tu auras intégré les mappers dans les services)
        return ResponseEntity.ok(null); // Remplace par le mapper quand prêt
    }
}