/*

Nom du fichier   : AuthController.java
Objectif         : Endpoints d'authentification - inscription avec vérification d'email par code à 6 chiffres, connexion bloquée tant que l'email n'est pas vérifié
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026
Date de mise à jour : 28/08/2026
Objet de mise à jour : Ajout de la vérification d'email obligatoire (register n'émet plus de JWT directement, ajout de /verify-email et /resend-code, login refuse les comptes non vérifiés), correction du bug register qui retournait toujours null

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.request.UtilisateurRequest;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.exceptions.BusinessRuleException;
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

        if (!Boolean.TRUE.equals(utilisateur.getEmailVerifie())) {
            throw new BusinessRuleException(
                    "Veuillez vérifier votre adresse email avant de vous connecter. "
                            + "Un code vous a été envoyé à l'inscription.");
        }

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
    public ResponseEntity<Map<String, String>> register(@RequestBody UtilisateurRequest request) {
        Utilisateur utilisateur = utilisateurService.creerUtilisateur(
                request.getNom(),
                request.getPrenom(),
                request.getEmail(),
                request.getMotDePasse(),
                request.getRole());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Compte créé. Un code de vérification a été envoyé à votre adresse email.");
        response.put("email", utilisateur.getEmail());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");

        utilisateurService.verifierEmail(email, code);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Email vérifié avec succès. Vous pouvez maintenant vous connecter.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-code")
    public ResponseEntity<Map<String, String>> resendCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");

        utilisateurService.renvoyerCodeVerification(email);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Un nouveau code a été envoyé.");

        return ResponseEntity.ok(response);
    }
}