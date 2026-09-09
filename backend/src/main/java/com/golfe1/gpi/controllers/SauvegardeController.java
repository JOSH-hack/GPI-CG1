package com.golfe1.gpi.controllers;

import com.golfe1.gpi.entities.Sauvegarde;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.entities.enums.DeclencheurSauvegarde;
import com.golfe1.gpi.services.SauvegardeService;
import com.golfe1.gpi.services.UtilisateurService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/outils/sauvegardes")
@PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
public class SauvegardeController {

    private final SauvegardeService sauvegardeService;
    private final UtilisateurService utilisateurService;

    public SauvegardeController(SauvegardeService sauvegardeService, UtilisateurService utilisateurService) {
        this.sauvegardeService = sauvegardeService;
        this.utilisateurService = utilisateurService;
    }

    private Utilisateur utilisateurConnecte() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return utilisateurService.getParEmail(authentication.getName());
    }

    @GetMapping
    public ResponseEntity<List<Sauvegarde>> lister() {
        return ResponseEntity.ok(sauvegardeService.listerSauvegardes());
    }

    @GetMapping("/taille-base")
    public ResponseEntity<Map<String, Long>> tailleBase() {
        Map<String, Long> body = new HashMap<>();
        body.put("tailleOctets", sauvegardeService.tailleTotaleBaseOctets());
        return ResponseEntity.ok(body);
    }

    @PostMapping("/effectuer")
    public ResponseEntity<Sauvegarde> effectuer() {
        Sauvegarde sauvegarde = sauvegardeService.effectuerSauvegarde(DeclencheurSauvegarde.MANUELLE,
                utilisateurConnecte());
        return ResponseEntity.ok(sauvegarde);
    }

    @GetMapping("/{id}/telecharger")
    public ResponseEntity<Resource> telecharger(@PathVariable Long id) {
        Path chemin = sauvegardeService.cheminTelechargement(id);
        Resource resource = new FileSystemResource(chemin);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + chemin.getFileName() + "\"")
                .body(resource);
    }

    // Operation destructive et irreversible - reservee au super admin
    @PostMapping("/{id}/restaurer")
    @PreAuthorize("hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<Void> restaurer(@PathVariable Long id) {
        sauvegardeService.restaurerSauvegarde(id, utilisateurConnecte());
        return ResponseEntity.noContent().build();
    }
}