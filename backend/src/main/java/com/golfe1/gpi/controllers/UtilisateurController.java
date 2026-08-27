package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.UtilisateurMapper;
import com.golfe1.gpi.dto.request.UtilisateurRequest;
import com.golfe1.gpi.dto.response.UtilisateurResponse;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.entities.enums.RoleUtilisateur;
import com.golfe1.gpi.exceptions.UnauthorizedActionException;
import com.golfe1.gpi.security.JwtUtil;
import com.golfe1.gpi.services.UtilisateurService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;
    private final UtilisateurMapper utilisateurMapper;
    private final JwtUtil jwtUtil;

    public UtilisateurController(UtilisateurService utilisateurService, UtilisateurMapper utilisateurMapper,
            JwtUtil jwtUtil) {
        this.utilisateurService = utilisateurService;
        this.utilisateurMapper = utilisateurMapper;
        this.jwtUtil = jwtUtil;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<UtilisateurResponse> modifier(@PathVariable Long id,
            @Valid @RequestBody UtilisateurRequest request) {
        Utilisateur utilisateur = utilisateurService.modifierUtilisateur(
                id, request.getNom(), request.getPrenom(), request.getEmail());
        return ResponseEntity.ok(utilisateurMapper.toResponse(utilisateur));
    }

    @PutMapping("/{id}/mot-de-passe")
    public ResponseEntity<Void> changerMotDePasse(@PathVariable Long id,
            @RequestParam String ancienMotDePasse,
            @RequestParam String nouveauMotDePasse,
            HttpServletRequest request) {
        Long idConnecte = extraireIdUtilisateur(request);
        if (!id.equals(idConnecte)) {
            throw new UnauthorizedActionException("Vous ne pouvez modifier que votre propre mot de passe");
        }
        utilisateurService.changerMotDePasse(id, ancienMotDePasse, nouveauMotDePasse);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reinitialiser-mot-de-passe")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<Void> reinitialiserMotDePasse(@PathVariable Long id,
            @RequestParam String nouveauMotDePasse) {
        utilisateurService.reinitialiserMotDePasse(id, nouveauMotDePasse);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/activer")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<UtilisateurResponse> activer(@PathVariable Long id) {
        Utilisateur utilisateur = utilisateurService.activer(id);
        return ResponseEntity.ok(utilisateurMapper.toResponse(utilisateur));
    }

    @PutMapping("/{id}/desactiver")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<UtilisateurResponse> desactiver(@PathVariable Long id) {
        Utilisateur utilisateur = utilisateurService.desactiver(id);
        return ResponseEntity.ok(utilisateurMapper.toResponse(utilisateur));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<List<UtilisateurResponse>> listerTous() {
        List<Utilisateur> utilisateurs = utilisateurService.listerTous();
        return ResponseEntity.ok(utilisateurs.stream().map(utilisateurMapper::toResponse).toList());
    }

    @GetMapping("/actifs")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<List<UtilisateurResponse>> listerActifs() {
        List<Utilisateur> utilisateurs = utilisateurService.listerActifs();
        return ResponseEntity.ok(utilisateurs.stream().map(utilisateurMapper::toResponse).toList());
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<List<UtilisateurResponse>> listerParRole(@PathVariable RoleUtilisateur role) {
        List<Utilisateur> utilisateurs = utilisateurService.listerParRole(role);
        return ResponseEntity.ok(utilisateurs.stream().map(utilisateurMapper::toResponse).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<UtilisateurResponse> getParId(@PathVariable Long id) {
        Utilisateur utilisateur = utilisateurService.getParId(id);
        return ResponseEntity.ok(utilisateurMapper.toResponse(utilisateur));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<UtilisateurResponse> changerRole(@PathVariable Long id,
            @RequestParam RoleUtilisateur nouveauRole) {
        Utilisateur utilisateur = utilisateurService.changerRole(id, nouveauRole);
        return ResponseEntity.ok(utilisateurMapper.toResponse(utilisateur));
    }

    // UTILITAIRE
    private Long extraireIdUtilisateur(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}