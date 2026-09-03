package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.EquipementMapper;
import com.golfe1.gpi.dto.request.*;
import com.golfe1.gpi.dto.response.*;
import com.golfe1.gpi.entities.*;
import com.golfe1.gpi.entities.enums.StatutEquipement;
import com.golfe1.gpi.services.AgentService;
import com.golfe1.gpi.services.EquipementService;
import com.golfe1.gpi.services.UtilisateurService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipements")
public class EquipementController {

    private final EquipementService equipementService;
    private final EquipementMapper equipementMapper;
    private final AgentService agentService;
    private final UtilisateurService utilisateurService;

    public EquipementController(EquipementService equipementService,
            EquipementMapper equipementMapper,
            AgentService agentService,
            UtilisateurService utilisateurService) {
        this.equipementService = equipementService;
        this.equipementMapper = equipementMapper;
        this.agentService = agentService;
        this.utilisateurService = utilisateurService;
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
            @RequestParam Long idAgent) {
        Long idOperateur = extraireIdUtilisateur();
        Equipement eq = equipementService.affecterAgent(id, idAgent, idOperateur);
        return ResponseEntity.ok(equipementMapper.toResponse(eq));
    }

    @PostMapping("/{id}/deplacer")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<EquipementResponse> deplacer(
            @PathVariable Long id,
            @RequestParam Long idNouvelleLocalisation,
            @RequestParam String motif) {
        Long idOperateur = extraireIdUtilisateur();
        Equipement eq = equipementService.deplacer(id, idNouvelleLocalisation, motif, idOperateur);
        return ResponseEntity.ok(equipementMapper.toResponse(eq));
    }

    @PostMapping("/{id}/mettre-au-rebut")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<EquipementResponse> mettreAuRebut(
            @PathVariable Long id,
            @RequestParam String motif) {
        Long idOperateur = extraireIdUtilisateur();
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
    public ResponseEntity<List<EquipementResponse>> monMateriel() {
        Long idUtilisateur = extraireIdUtilisateur();
        Agent agent = agentService.getParUtilisateur(idUtilisateur);
        List<Equipement> equipements = equipementService.listerParAgent(agent.getIdAgent());
        return ResponseEntity.ok(equipements.stream().map(equipementMapper::toResponse).toList());
    }

    // UTILITAIRE

    // Le token JWT voyage desormais dans un cookie httpOnly, lu par JwtFilter qui
    // peuple le SecurityContext - on ne doit plus jamais lire l'en-tete
    // Authorization ici (il n'est plus envoye par le navigateur, ce qui causait un
    // NullPointerException sur authHeader.substring(7)).
    private Long extraireIdUtilisateur() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurService.getParEmail(email).getIdUtilisateur();
    }
}