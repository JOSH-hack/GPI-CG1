/*

Nom du fichier   : EquipementRequest.java
Objectif         : DTO de requête de base pour tout équipement (champs communs)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.request;

import com.golfe1.gpi.entities.enums.StatutEquipement;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public class EquipementRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le code inventaire est obligatoire")
    private String codeInventaire;

    private String numeroSerie;
    private String tagQr;
    private String marque;
    private String modele;
    private String description;

    @NotNull(message = "La date d'acquisition est obligatoire")
    private LocalDate dateAcquisition;

    private LocalDate finGarantie;

    @Positive(message = "Le coût d'acquisition doit être positif")
    private BigDecimal coutAcquisition;

    private StatutEquipement statut;

    @NotNull(message = "L'ID catégorie est obligatoire")
    private Long idCategorie;

    @NotNull(message = "L'ID localisation est obligatoire")
    private Long idLocalisation;

    private Long idAgent;

    // Getters & Setters
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

    public Long getIdCategorie() {
        return idCategorie;
    }

    public void setIdCategorie(Long idCategorie) {
        this.idCategorie = idCategorie;
    }

    public Long getIdLocalisation() {
        return idLocalisation;
    }

    public void setIdLocalisation(Long idLocalisation) {
        this.idLocalisation = idLocalisation;
    }

    public Long getIdAgent() {
        return idAgent;
    }

    public void setIdAgent(Long idAgent) {
        this.idAgent = idAgent;
    }
}