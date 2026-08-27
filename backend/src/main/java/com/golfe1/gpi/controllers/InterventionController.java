/*

Nom du fichier   : InterventionController.java
Objectif         : Endpoints REST pour les interventions (CRUD + diagnostic + rapport + validation DSI)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.InterventionMapper;
import com.golfe1.gpi.dto.request.InterventionRequest;
import com.golfe1.gpi.dto.response.InterventionResponse;
import com.golfe1.gpi.entities.Intervention;
import com.golfe1.gpi.security.JwtUtil;
import com.golfe1.gpi.services.InterventionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interventions")
public class InterventionController {

    private final InterventionService interventionService;
    private final InterventionMapper interventionMapper;
    private final JwtUtil jwtUtil;

    public InterventionController(InterventionService interventionService,
            InterventionMapper interventionMapper,
            JwtUtil jwtUtil) {
        this.interventionService = interventionService;
        this.interventionMapper = interventionMapper;
        this.jwtUtil = jwtUtil;
    }

    // CREATION
    @PostMapping
    @PreAuthorize("hasRole('TECHNICIEN') or hasRole('ADMIN')")
    public ResponseEntity<InterventionResponse> creer(@Valid @RequestBody InterventionRequest request) {
        Intervention intervention = interventionService.creerIntervention(
                request.getIdPanne(),
                request.getIdTechnicien(),
                request.getTypeIntervention());
        return ResponseEntity.status(HttpStatus.CREATED).body(interventionMapper.toResponse(intervention));
    }

    // DIAGNOSTIC
    @PutMapping("/{id}/diagnostic")
    @PreAuthorize("hasRole('TECHNICIEN') or hasRole('ADMIN')")
    public ResponseEntity<InterventionResponse> enregistrerDiagnostic(
            @PathVariable Long id,
            @RequestParam String diagnostic,
            @RequestParam(required = false) String solution,
            @RequestParam(required = false) String piecesRemplacees) {
        Intervention intervention = interventionService.enregistrerDiagnostic(id, diagnostic, solution,
                piecesRemplacees);
        return ResponseEntity.ok(interventionMapper.toResponse(intervention));
    }

    // RAPPORT (TECHNICIEN)
    @PostMapping("/{id}/rapport")
    @PreAuthorize("hasRole('TECHNICIEN') or hasRole('ADMIN')")
    public ResponseEntity<InterventionResponse> redigerRapport(
            @PathVariable Long id,
            @RequestParam String rapport,
            HttpServletRequest request) {
        Long idTechnicien = extraireIdUtilisateur(request);
        Intervention intervention = interventionService.redigerRapport(id, rapport, idTechnicien);
        return ResponseEntity.ok(interventionMapper.toResponse(intervention));
    }

    // VALIDATION DSI
    @PostMapping("/{id}/valider")
    @PreAuthorize("hasRole('DSI') or hasRole('ADMIN')")
    public ResponseEntity<InterventionResponse> validerParDsi(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long idValidateur = extraireIdUtilisateur(request);
        Intervention intervention = interventionService.validerParDsi(id, idValidateur);
        return ResponseEntity.ok(interventionMapper.toResponse(intervention));
    }

    // CONSULTATION
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIEN') or hasRole('DSI')")
    public ResponseEntity<List<InterventionResponse>> listerToutes() {
        // À adapter selon ta méthode dans le service
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIEN') or hasRole('DSI')")
    public ResponseEntity<InterventionResponse> getParId(@PathVariable Long id) {
        // À implémenter dans le service si besoin
        return ResponseEntity.ok(null);
    }

    @GetMapping("/panne/{idPanne}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIEN') or hasRole('DSI')")
    public ResponseEntity<List<InterventionResponse>> listerParPanne(@PathVariable Long idPanne) {
        List<Intervention> interventions = interventionService.listerParPanne(idPanne);
        List<InterventionResponse> responses = interventions.stream()
                .map(interventionMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/en-attente-dsi")
    @PreAuthorize("hasRole('DSI') or hasRole('ADMIN')")
    public ResponseEntity<List<InterventionResponse>> listerEnAttenteDsi() {
        List<Intervention> interventions = interventionService.listerEnAttenteValidationDsi();
        List<InterventionResponse> responses = interventions.stream()
                .map(interventionMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    // UTILITAIRE
    private Long extraireIdUtilisateur(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }

    @PutMapping("/{id}/resultat")
    @PreAuthorize("hasRole('TECHNICIEN')")
    public ResponseEntity<InterventionResponse> enregistrerResultat(
            @PathVariable Long id,
            @RequestParam com.golfe1.gpi.entities.enums.ResultatIntervention resultat,
            HttpServletRequest request) {
        Long idTechnicien = extraireIdUtilisateur(request);
        Intervention intervention = interventionService.enregistrerResultat(id, resultat, idTechnicien);
        return ResponseEntity.ok(interventionMapper.toResponse(intervention));
    }
}