/*

Nom du fichier   : HistoriqueMouvementResponse.java
Objectif         : DTO de réponse pour l'historique des mouvements (timeline)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.response;

import com.golfe1.gpi.entities.enums.TypeMouvement;

import java.time.LocalDateTime;

public class HistoriqueMouvementResponse {

    private Long idMouvement;
    private TypeMouvement typeMouvement;
    private String motif;
    private String ancienneValeur;
    private String nouvelleValeur;
    private LocalDateTime dateMouvement;
    private EquipementResponse equipement;
    private UtilisateurResponse operateur;

    // Getters & Setters
    public Long getIdMouvement() {
        return idMouvement;
    }

    public void setIdMouvement(Long idMouvement) {
        this.idMouvement = idMouvement;
    }

    public TypeMouvement getTypeMouvement() {
        return typeMouvement;
    }

    public void setTypeMouvement(TypeMouvement typeMouvement) {
        this.typeMouvement = typeMouvement;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public String getAncienneValeur() {
        return ancienneValeur;
    }

    public void setAncienneValeur(String ancienneValeur) {
        this.ancienneValeur = ancienneValeur;
    }

    public String getNouvelleValeur() {
        return nouvelleValeur;
    }

    public void setNouvelleValeur(String nouvelleValeur) {
        this.nouvelleValeur = nouvelleValeur;
    }

    public LocalDateTime getDateMouvement() {
        return dateMouvement;
    }

    public void setDateMouvement(LocalDateTime dateMouvement) {
        this.dateMouvement = dateMouvement;
    }

    public EquipementResponse getEquipement() {
        return equipement;
    }

    public void setEquipement(EquipementResponse equipement) {
        this.equipement = equipement;
    }

    public UtilisateurResponse getOperateur() {
        return operateur;
    }

    public void setOperateur(UtilisateurResponse operateur) {
        this.operateur = operateur;
    }
}