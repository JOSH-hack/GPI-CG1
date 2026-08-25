/*

Nom du fichier   : EquipementResponse.java
Objectif         : DTO de réponse de base pour tout équipement
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.response;

import com.golfe1.gpi.entities.enums.StatutEquipement;

import java.math.BigDecimal;
import java.time.LocalDate;

public class EquipementResponse {

    private Long idEquipement;
    private String nom;
    private String codeInventaire;
    private String numeroSerie;
    private String tagQr;
    private String marque;
    private String modele;
    private String description;
    private LocalDate dateAcquisition;
    private LocalDate finGarantie;
    private BigDecimal coutAcquisition;
    private StatutEquipement statut;
    private CategorieResponse categorie;
    private LocalisationResponse localisation;
    private AgentResponse agent;

    // Getters & Setters
    public Long getIdEquipement() {
        return idEquipement;
    }

    public void setIdEquipement(Long idEquipement) {
        this.idEquipement = idEquipement;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getCodeInventaire() {
        return codeInventaire;
    }

    public void setCodeInventaire(String codeInventaire) {
        this.codeInventaire = codeInventaire;
    }

    public String getNumeroSerie() {
        return numeroSerie;
    }

    public void setNumeroSerie(String numeroSerie) {
        this.numeroSerie = numeroSerie;
    }

    public String getTagQr() {
        return tagQr;
    }

    public void setTagQr(String tagQr) {
        this.tagQr = tagQr;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public String getModele() {
        return modele;
    }

    public void setModele(String modele) {
        this.modele = modele;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDateAcquisition() {
        return dateAcquisition;
    }

    public void setDateAcquisition(LocalDate dateAcquisition) {
        this.dateAcquisition = dateAcquisition;
    }

    public LocalDate getFinGarantie() {
        return finGarantie;
    }

    public void setFinGarantie(LocalDate finGarantie) {
        this.finGarantie = finGarantie;
    }

    public BigDecimal getCoutAcquisition() {
        return coutAcquisition;
    }

    public void setCoutAcquisition(BigDecimal coutAcquisition) {
        this.coutAcquisition = coutAcquisition;
    }

    public StatutEquipement getStatut() {
        return statut;
    }

    public void setStatut(StatutEquipement statut) {
        this.statut = statut;
    }

    public CategorieResponse getCategorie() {
        return categorie;
    }

    public void setCategorie(CategorieResponse categorie) {
        this.categorie = categorie;
    }

    public LocalisationResponse getLocalisation() {
        return localisation;
    }

    public void setLocalisation(LocalisationResponse localisation) {
        this.localisation = localisation;
    }

    public AgentResponse getAgent() {
        return agent;
    }

    public void setAgent(AgentResponse agent) {
        this.agent = agent;
    }
}