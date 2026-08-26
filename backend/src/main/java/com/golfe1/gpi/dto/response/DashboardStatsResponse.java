/*

Nom du fichier   : DashboardStatsResponse.java
Objectif         : DTO de réponse pour les statistiques du tableau de bord (KPIs)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.response;

public class DashboardStatsResponse {

    private Long totalEquipements;
    private Long equipementsEnService;
    private Long equipementsEnStock;
    private Long equipementsEnPanne;
    private Long equipementsMisAuRebut;
    private Long totalPannes;
    private Long pannesEnCours;
    private Long pannesCritiques;
    private Long interventionsEnAttenteDsi;
    private Long totalAgents;
    private Long totalUtilisateurs;

    // Getters & Setters
    public Long getTotalEquipements() {
        return totalEquipements;
    }

    public void setTotalEquipements(Long totalEquipements) {
        this.totalEquipements = totalEquipements;
    }

    public Long getEquipementsEnService() {
        return equipementsEnService;
    }

    public void setEquipementsEnService(Long equipementsEnService) {
        this.equipementsEnService = equipementsEnService;
    }

    public Long getEquipementsEnStock() {
        return equipementsEnStock;
    }

    public void setEquipementsEnStock(Long equipementsEnStock) {
        this.equipementsEnStock = equipementsEnStock;
    }

    public Long getEquipementsEnPanne() {
        return equipementsEnPanne;
    }

    public void setEquipementsEnPanne(Long equipementsEnPanne) {
        this.equipementsEnPanne = equipementsEnPanne;
    }

    public Long getEquipementsMisAuRebut() {
        return equipementsMisAuRebut;
    }

    public void setEquipementsMisAuRebut(Long equipementsMisAuRebut) {
        this.equipementsMisAuRebut = equipementsMisAuRebut;
    }

    public Long getTotalPannes() {
        return totalPannes;
    }

    public void setTotalPannes(Long totalPannes) {
        this.totalPannes = totalPannes;
    }

    public Long getPannesEnCours() {
        return pannesEnCours;
    }

    public void setPannesEnCours(Long pannesEnCours) {
        this.pannesEnCours = pannesEnCours;
    }

    public Long getPannesCritiques() {
        return pannesCritiques;
    }

    public void setPannesCritiques(Long pannesCritiques) {
        this.pannesCritiques = pannesCritiques;
    }

    public Long getInterventionsEnAttenteDsi() {
        return interventionsEnAttenteDsi;
    }

    public void setInterventionsEnAttenteDsi(Long interventionsEnAttenteDsi) {
        this.interventionsEnAttenteDsi = interventionsEnAttenteDsi;
    }

    public Long getTotalAgents() {
        return totalAgents;
    }

    public void setTotalAgents(Long totalAgents) {
        this.totalAgents = totalAgents;
    }

    public Long getTotalUtilisateurs() {
        return totalUtilisateurs;
    }

    public void setTotalUtilisateurs(Long totalUtilisateurs) {
        this.totalUtilisateurs = totalUtilisateurs;
    }
}