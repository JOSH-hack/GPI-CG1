package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.HistoriqueMouvementMapper;
import com.golfe1.gpi.dto.response.HistoriqueMouvementResponse;
import com.golfe1.gpi.entities.HistoriqueMouvement;
import com.golfe1.gpi.entities.enums.TypeMouvement;
import com.golfe1.gpi.services.HistoriqueMouvementService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/historique-mouvements")
@PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('RESPONSABLE_DSI')")
public class HistoriqueMouvementController {

    private final HistoriqueMouvementService historiqueMouvementService;
    private final HistoriqueMouvementMapper historiqueMouvementMapper;

    public HistoriqueMouvementController(HistoriqueMouvementService historiqueMouvementService,
            HistoriqueMouvementMapper historiqueMouvementMapper) {
        this.historiqueMouvementService = historiqueMouvementService;
        this.historiqueMouvementMapper = historiqueMouvementMapper;
    }

    @GetMapping("/equipement/{idEquipement}/timeline")
    public ResponseEntity<List<HistoriqueMouvementResponse>> timelineParEquipement(@PathVariable Long idEquipement) {
        List<HistoriqueMouvement> mouvements = historiqueMouvementService.timelineParEquipement(idEquipement);
        return ResponseEntity.ok(mouvements.stream().map(historiqueMouvementMapper::toResponse).toList());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<HistoriqueMouvementResponse>> listerParType(@PathVariable TypeMouvement type) {
        List<HistoriqueMouvement> mouvements = historiqueMouvementService.listerParType(type);
        return ResponseEntity.ok(mouvements.stream().map(historiqueMouvementMapper::toResponse).toList());
    }

    @GetMapping("/operateur/{idOperateur}")
    public ResponseEntity<List<HistoriqueMouvementResponse>> listerParOperateur(@PathVariable Long idOperateur) {
        List<HistoriqueMouvement> mouvements = historiqueMouvementService.listerParOperateur(idOperateur);
        return ResponseEntity.ok(mouvements.stream().map(historiqueMouvementMapper::toResponse).toList());
    }

    @GetMapping("/periode")
    public ResponseEntity<List<HistoriqueMouvementResponse>> listerParPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        List<HistoriqueMouvementResponse> responses = historiqueMouvementService.listerParPeriode(debut, fin)
                .stream().map(historiqueMouvementMapper::toResponse).toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping
    public ResponseEntity<List<HistoriqueMouvementResponse>> listerTout() {
        List<HistoriqueMouvement> mouvements = historiqueMouvementService.listerTout();
        return ResponseEntity.ok(mouvements.stream().map(historiqueMouvementMapper::toResponse).toList());
    }
}