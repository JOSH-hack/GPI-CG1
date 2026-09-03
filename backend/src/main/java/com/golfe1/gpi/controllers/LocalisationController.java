/*

Nom du fichier   : LocalisationController.java
Objectif         : Endpoints REST pour la gestion des localisations (annexes, services, bureaux)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.LocalisationMapper;
import com.golfe1.gpi.dto.request.LocalisationRequest;
import com.golfe1.gpi.dto.response.LocalisationResponse;
import com.golfe1.gpi.entities.Localisation;
import com.golfe1.gpi.services.LocalisationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/localisations")
public class LocalisationController {

    private final LocalisationService localisationService;
    private final LocalisationMapper localisationMapper;

    public LocalisationController(LocalisationService localisationService, LocalisationMapper localisationMapper) {
        this.localisationService = localisationService;
        this.localisationMapper = localisationMapper;
    }

    // CREATION
    @PostMapping
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<LocalisationResponse> creer(@Valid @RequestBody LocalisationRequest request) {
        Localisation localisation = localisationService.creerLocalisation(
                request.getAnnexe(),
                request.getService(),
                request.getBureau(),
                request.getPoste());
        return ResponseEntity.status(HttpStatus.CREATED).body(localisationMapper.toResponse(localisation));
    }

    // MODIFICATION
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<LocalisationResponse> modifier(@PathVariable Long id,
            @Valid @RequestBody LocalisationRequest request) {
        Localisation localisation = localisationService.modifierLocalisation(
                id,
                request.getAnnexe(),
                request.getService(),
                request.getBureau(),
                request.getPoste());
        return ResponseEntity.ok(localisationMapper.toResponse(localisation));
    }

    // SUPPRESSION
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('RESPONSABLE_DSI') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        localisationService.supprimerLocalisation(id);
        return ResponseEntity.noContent().build();
    }

    // CONSULTATION
    @GetMapping
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<List<LocalisationResponse>> listerToutes() {
        List<Localisation> localisations = localisationService.listerToutes();
        List<LocalisationResponse> responses = localisations.stream()
                .map(localisationMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<LocalisationResponse> getParId(@PathVariable Long id) {
        Localisation localisation = localisationService.getParId(id);
        return ResponseEntity.ok(localisationMapper.toResponse(localisation));
    }

    @GetMapping("/recherche")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<List<LocalisationResponse>> rechercher(
            @RequestParam(required = false) String annexe,
            @RequestParam(required = false) String service) {

        List<Localisation> localisations;
        if (annexe != null && !annexe.isBlank()) {
            localisations = localisationService.rechercherParAnnexe(annexe);
        } else if (service != null && !service.isBlank()) {
            localisations = localisationService.rechercherParService(service);
        } else {
            localisations = localisationService.listerToutes();
        }

        List<LocalisationResponse> responses = localisations.stream()
                .map(localisationMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }
}