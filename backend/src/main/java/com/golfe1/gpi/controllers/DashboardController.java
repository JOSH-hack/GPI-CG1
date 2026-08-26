/*

Nom du fichier   : DashboardController.java
Objectif         : Endpoints REST pour les statistiques du tableau de bord (KPIs)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.response.DashboardStatsResponse;
import com.golfe1.gpi.entities.enums.StatutEquipement;
import com.golfe1.gpi.entities.enums.StatutPanne;
import com.golfe1.gpi.services.EquipementService;
import com.golfe1.gpi.services.InterventionService;
import com.golfe1.gpi.services.PanneService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final EquipementService equipementService;
    private final PanneService panneService;
    private final InterventionService interventionService;

    public DashboardController(EquipementService equipementService,
            PanneService panneService,
            InterventionService interventionService) {
        this.equipementService = equipementService;
        this.panneService = panneService;
        this.interventionService = interventionService;
    }

    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        // Équipements
        Long totalEquipements = equipementService.compterParStatut(StatutEquipement.EN_SERVICE)
                + equipementService.compterParStatut(StatutEquipement.EN_STOCK)
                + equipementService.compterParStatut(StatutEquipement.EN_PANNE)
                + equipementService.compterParStatut(StatutEquipement.MIS_AU_REBUT);

        stats.setTotalEquipements(totalEquipements);
        stats.setEquipementsEnService(equipementService.compterParStatut(StatutEquipement.EN_SERVICE));
        stats.setEquipementsEnStock(equipementService.compterParStatut(StatutEquipement.EN_STOCK));
        stats.setEquipementsEnPanne(equipementService.compterParStatut(StatutEquipement.EN_PANNE));
        stats.setEquipementsMisAuRebut(equipementService.compterParStatut(StatutEquipement.MIS_AU_REBUT));

        // Pannes
        stats.setTotalPannes((long) panneService.listerParStatut(StatutPanne.SIGNALEE).size()
                + panneService.listerParStatut(StatutPanne.EN_COURS_TRAITEMENT).size()
                + panneService.listerParStatut(StatutPanne.REPAREE).size()
                + panneService.listerParStatut(StatutPanne.REFORMEE).size());
        stats.setPannesEnCours((long) panneService.listerActives().size());
        stats.setPannesCritiques(panneService.compterCritiquesNonReparees());

        // Interventions
        stats.setInterventionsEnAttenteDsi((long) interventionService.listerEnAttenteValidationDsi().size());

        return ResponseEntity.ok(stats);
    }
}