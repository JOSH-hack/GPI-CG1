/*

Nom du fichier   : SauvegardeController.java
Objectif         : Endpoints REST pour les sauvegardes de la base de donnees
                    (module Outils). Restauration reservee a ADMIN_SYSTEME.
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026
Date de mise à jour : 10/09/2026
Objet de mise à jour : Renvoi de SauvegardeResponse au lieu de l'entite brute
                        (fuite du mot de passe hache via operateur corrigee)

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.response.SauvegardeResponse;
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

    private SauvegardeResponse versResponse(Sauvegarde sauvegarde) {
        SauvegardeResponse response = new SauvegardeResponse();
        response.setIdSauvegarde(sauvegarde.getIdSauvegarde());
        response.setDateSauvegarde(sauvegarde.getDateSauvegarde());
        response.setTailleOctets(sauvegarde.getTailleOctets());
        response.setStatut(sauvegarde.getStatut());
        response.setDeclencheur(sauvegarde.getDeclencheur());
        response.setMessageErreur(sauvegarde.getMessageErreur());
        if (sauvegarde.getOperateur() != null) {
            response.setOperateurNom(sauvegarde.getOperateur().getNom() + " " + sauvegarde.getOperateur().getPrenom());
        }
        return response;
    }

    @GetMapping
    public ResponseEntity<List<SauvegardeResponse>> lister() {
        List<SauvegardeResponse> responses = sauvegardeService.listerSauvegardes().stream()
                .map(this::versResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/taille-base")
    public ResponseEntity<Map<String, Long>> tailleBase() {
        Map<String, Long> body = new HashMap<>();
        body.put("tailleOctets", sauvegardeService.tailleTotaleBaseOctets());
        return ResponseEntity.ok(body);
    }

    @PostMapping("/effectuer")
    public ResponseEntity<SauvegardeResponse> effectuer() {
        Sauvegarde sauvegarde = sauvegardeService.effectuerSauvegarde(DeclencheurSauvegarde.MANUELLE,
                utilisateurConnecte());
        return ResponseEntity.ok(versResponse(sauvegarde));
    }

    @GetMapping("/{id}/telecharger")
    public ResponseEntity<Resource> telecharger(@PathVariable Long id) {
        Path chemin = sauvegardeService.cheminTelechargement(id);
        Resource resource = new FileSystemResource(chemin);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + chemin.getFileName() + "\"")
                .body(resource);
    }

    @PostMapping("/{id}/restaurer")
    @PreAuthorize("hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<Void> restaurer(@PathVariable Long id) {
        sauvegardeService.restaurerSauvegarde(id, utilisateurConnecte());
        return ResponseEntity.noContent().build();
    }
}