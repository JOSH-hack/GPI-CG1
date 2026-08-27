package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.PanneMapper;
import com.golfe1.gpi.dto.request.PanneRequest;
import com.golfe1.gpi.dto.response.PanneResponse;
import com.golfe1.gpi.entities.Panne;
import com.golfe1.gpi.entities.enums.StatutPanne;
import com.golfe1.gpi.security.JwtUtil;
import com.golfe1.gpi.services.PanneService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pannes")
public class PanneController {

    private final PanneService panneService;
    private final PanneMapper panneMapper;
    private final JwtUtil jwtUtil;

    public PanneController(PanneService panneService, PanneMapper panneMapper, JwtUtil jwtUtil) {
        this.panneService = panneService;
        this.panneMapper = panneMapper;
        this.jwtUtil = jwtUtil;
    }

    // SIGNALEMENT
    @PostMapping("/signaler")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<PanneResponse> signaler(
            @Valid @RequestBody PanneRequest request,
            HttpServletRequest httpRequest) {
        Long idSignaleur = extraireIdUtilisateur(httpRequest);
        Panne panne = panneService.signalerPanne(
                request.getIdEquipement(),
                idSignaleur,
                request.getDescription(),
                request.getPriorite());
        return ResponseEntity.status(HttpStatus.CREATED).body(panneMapper.toResponse(panne));
    }

    // NOTATION (uniquement l'agent qui a signalé la panne)
    @PostMapping("/{id}/noter")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<PanneResponse> noter(
            @PathVariable Long id,
            @RequestParam Short note,
            HttpServletRequest httpRequest) {
        Long idUtilisateur = extraireIdUtilisateur(httpRequest);
        Panne panne = panneService.getParId(id);
        if (!panne.getUtilisateurSignaleur().getIdUtilisateur().equals(idUtilisateur)) {
            throw new com.golfe1.gpi.exceptions.UnauthorizedActionException(
                    "Vous ne pouvez noter que vos propres signalements");
        }
        panne = panneService.noterSatisfaction(id, note);
        return ResponseEntity.ok(panneMapper.toResponse(panne));
    }

    // REFORME
    @PostMapping("/{id}/reformer")
    @PreAuthorize("hasRole('TECHNICIEN') or hasRole('ADMIN_INFO') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<PanneResponse> reformer(
            @PathVariable Long id,
            @RequestParam String motif,
            HttpServletRequest httpRequest) {
        Long idOperateur = extraireIdUtilisateur(httpRequest);
        Panne panne = panneService.reformerPanne(id, motif, idOperateur);
        return ResponseEntity.ok(panneMapper.toResponse(panne));
    }

    // CONSULTATION
    @GetMapping
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<List<PanneResponse>> listerActives() {
        List<Panne> pannes = panneService.listerActives();
        return ResponseEntity.ok(pannes.stream().map(panneMapper::toResponse).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<PanneResponse> getParId(@PathVariable Long id) {
        Panne panne = panneService.getParId(id);
        return ResponseEntity.ok(panneMapper.toResponse(panne));
    }

    @GetMapping("/equipement/{idEquipement}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<List<PanneResponse>> listerParEquipement(@PathVariable Long idEquipement) {
        List<Panne> pannes = panneService.listerParEquipement(idEquipement);
        return ResponseEntity.ok(pannes.stream().map(panneMapper::toResponse).toList());
    }

    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<List<PanneResponse>> listerParStatut(@PathVariable StatutPanne statut) {
        List<Panne> pannes = panneService.listerParStatut(statut);
        return ResponseEntity.ok(pannes.stream().map(panneMapper::toResponse).toList());
    }

    @GetMapping("/critiques")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<Long> compterCritiques() {
        return ResponseEntity.ok(panneService.compterCritiquesNonReparees());
    }

    // AGENT - SES PROPRES SIGNALEMENTS
    @GetMapping("/mes-signalements")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<List<PanneResponse>> mesSignalements(HttpServletRequest httpRequest) {
        Long idUtilisateur = extraireIdUtilisateur(httpRequest);
        List<Panne> pannes = panneService.listerParSignaleur(idUtilisateur);
        return ResponseEntity.ok(pannes.stream().map(panneMapper::toResponse).toList());
    }

    // UTILITAIRE
    private Long extraireIdUtilisateur(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}