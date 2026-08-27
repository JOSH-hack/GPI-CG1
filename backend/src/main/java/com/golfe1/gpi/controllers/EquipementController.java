package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.EquipementMapper;
import com.golfe1.gpi.dto.request.*;
import com.golfe1.gpi.dto.response.*;
import com.golfe1.gpi.entities.*;
import com.golfe1.gpi.entities.enums.StatutEquipement;
import com.golfe1.gpi.security.JwtUtil;
import com.golfe1.gpi.services.AgentService;
import com.golfe1.gpi.services.EquipementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipements")
public class EquipementController {

    private final EquipementService equipementService;
    private final EquipementMapper equipementMapper;
    private final AgentService agentService;
    private final JwtUtil jwtUtil;

    public EquipementController(EquipementService equipementService,
            EquipementMapper equipementMapper,
            AgentService agentService,
            JwtUtil jwtUtil) {
        this.equipementService = equipementService;
        this.equipementMapper = equipementMapper;
        this.agentService = agentService;
        this.jwtUtil = jwtUtil;
    }

    // CREATION SOUS-TYPES

    @PostMapping("/materiel")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<EquipementMaterielResponse> creerMateriel(
            @Valid @RequestBody EquipementMaterielRequest request) {
        EquipementMateriel eq = equipementService.creerEquipementMateriel(
                equipementMapper.toEntity(request),
                request.getIdCategorie(),
                request.getIdLocalisation());
        return ResponseEntity.status(HttpStatus.CREATED).body(equipementMapper.toResponse(eq));
    }

    @PostMapping("/logiciel")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<EquipementLogicielResponse> creerLogiciel(
            @Valid @RequestBody EquipementLogicielRequest request) {
        EquipementLogiciel eq = equipementService.creerEquipementLogiciel(
                equipementMapper.toEntity(request),
                request.getIdCategorie(),
                request.getIdLocalisation());
        return ResponseEntity.status(HttpStatus.CREATED).body(equipementMapper.toResponse(eq));
    }

    @PostMapping("/reseau")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<EquipementReseauResponse> creerReseau(
            @Valid @RequestBody EquipementReseauRequest request) {
        EquipementReseau eq = equipementService.creerEquipementReseau(
                equipementMapper.toEntity(request),
                request.getIdCategorie(),
                request.getIdLocalisation());
        return ResponseEntity.status(HttpStatus.CREATED).body(equipementMapper.toResponse(eq));
    }

    // ACTIONS MÉTIER

    @PostMapping("/{id}/affecter")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<EquipementResponse> affecterAgent(
            @PathVariable Long id,
            @RequestParam Long idAgent,
            HttpServletRequest request) {
        Long idOperateur = extraireIdUtilisateur(request);
        Equipement eq = equipementService.affecterAgent(id, idAgent, idOperateur);
        return ResponseEntity.ok(equipementMapper.toResponse(eq));
    }

    @PostMapping("/{id}/deplacer")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<EquipementResponse> deplacer(
            @PathVariable Long id,
            @RequestParam Long idNouvelleLocalisation,
            @RequestParam String motif,
            HttpServletRequest request) {
        Long idOperateur = extraireIdUtilisateur(request);
        Equipement eq = equipementService.deplacer(id, idNouvelleLocalisation, motif, idOperateur);
        return ResponseEntity.ok(equipementMapper.toResponse(eq));
    }

    @PostMapping("/{id}/mettre-au-rebut")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<EquipementResponse> mettreAuRebut(
            @PathVariable Long id,
            @RequestParam String motif,
            HttpServletRequest request) {
        Long idOperateur = extraireIdUtilisateur(request);
        Equipement eq = equipementService.mettreAuRebut(id, motif, idOperateur);
        return ResponseEntity.ok(equipementMapper.toResponse(eq));
    }

    // CONSULTATION

    @GetMapping
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<List<EquipementResponse>> listerTous() {
        List<Equipement> equipements = equipementService.listerTous();
        return ResponseEntity.ok(equipements.stream().map(equipementMapper::toResponse).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<EquipementResponse> getParId(@PathVariable Long id) {
        Equipement eq = equipementService.getParId(id);
        return ResponseEntity.ok(equipementMapper.toResponse(eq));
    }

    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<List<EquipementResponse>> listerParStatut(@PathVariable StatutEquipement statut) {
        List<Equipement> equipements = equipementService.listerParStatut(statut);
        return ResponseEntity.ok(equipements.stream().map(equipementMapper::toResponse).toList());
    }

    @GetMapping("/categorie/{idCategorie}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<List<EquipementResponse>> listerParCategorie(@PathVariable Long idCategorie) {
        List<Equipement> equipements = equipementService.listerParCategorie(idCategorie);
        return ResponseEntity.ok(equipements.stream().map(equipementMapper::toResponse).toList());
    }

    @GetMapping("/code/{codeInventaire}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<EquipementResponse> getParCodeInventaire(@PathVariable String codeInventaire) {
        Equipement eq = equipementService.getParCodeInventaire(codeInventaire);
        return ResponseEntity.ok(equipementMapper.toResponse(eq));
    }

    // AGENT - SON PROPRE MATÉRIEL
    @GetMapping("/mon-materiel")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<List<EquipementResponse>> monMateriel(HttpServletRequest request) {
        Long idUtilisateur = extraireIdUtilisateur(request);
        Agent agent = agentService.getParUtilisateur(idUtilisateur);
        List<Equipement> equipements = equipementService.listerParAgent(agent.getIdAgent());
        return ResponseEntity.ok(equipements.stream().map(equipementMapper::toResponse).toList());
    }

    // UTILITAIRE

    private Long extraireIdUtilisateur(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}