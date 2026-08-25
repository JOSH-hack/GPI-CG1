/*

Nom du fichier   : PanneResponse.java
Objectif         : DTO de réponse pour une panne (avec équipement et signaleur)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.response;

import com.golfe1.gpi.entities.enums.PrioritePanne;
import com.golfe1.gpi.entities.enums.StatutPanne;

import java.time.LocalDateTime;

public class PanneResponse {

    private Long idPanne;
    private String description;
    private PrioritePanne priorite;
    private StatutPanne statut;
    private Short noteSatisfaction;
    private LocalDateTime dateSurvenance;
    private EquipementResponse equipement;
    private UtilisateurResponse utilisateurSignaleur;

    // Getters & Setters
    public Long getIdPanne() {
        return idPanne;
    }

    public void setIdPanne(Long idPanne) {
        this.idPanne = idPanne;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public PrioritePanne getPriorite() {
        return priorite;
    }

    public void setPriorite(PrioritePanne priorite) {
        this.priorite = priorite;
    }

    public StatutPanne getStatut() {
        return statut;
    }

    public void setStatut(StatutPanne statut) {
        this.statut = statut;
    }

    public Short getNoteSatisfaction() {
        return noteSatisfaction;
    }

    public void setNoteSatisfaction(Short noteSatisfaction) {
        this.noteSatisfaction = noteSatisfaction;
    }

    public LocalDateTime getDateSurvenance() {
        return dateSurvenance;
    }

    public void setDateSurvenance(LocalDateTime dateSurvenance) {
        this.dateSurvenance = dateSurvenance;
    }

    public EquipementResponse getEquipement() {
        return equipement;
    }

    public void setEquipement(EquipementResponse equipement) {
        this.equipement = equipement;
    }

    public UtilisateurResponse getUtilisateurSignaleur() {
        return utilisateurSignaleur;
    }

    public void setUtilisateurSignaleur(UtilisateurResponse utilisateurSignaleur) {
        this.utilisateurSignaleur = utilisateurSignaleur;
    }
}