/*

Nom du fichier   : EquipementLogicielResponse.java
Objectif         : DTO de réponse spécifique aux logiciels
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.response;

import java.time.LocalDate;

public class EquipementLogicielResponse extends EquipementResponse {

    private String version;
    private String editeur;
    private Integer nombreLicences;
    private String cleLicence;
    private LocalDate dateDebutLicence;
    private LocalDate dateExpirationLicence;

    // Getters & Setters
    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getEditeur() {
        return editeur;
    }

    public void setEditeur(String editeur) {
        this.editeur = editeur;
    }

    public Integer getNombreLicences() {
        return nombreLicences;
    }

    public void setNombreLicences(Integer nombreLicences) {
        this.nombreLicences = nombreLicences;
    }

    public String getCleLicence() {
        return cleLicence;
    }

    public void setCleLicence(String cleLicence) {
        this.cleLicence = cleLicence;
    }

    public LocalDate getDateDebutLicence() {
        return dateDebutLicence;
    }

    public void setDateDebutLicence(LocalDate dateDebutLicence) {
        this.dateDebutLicence = dateDebutLicence;
    }

    public LocalDate getDateExpirationLicence() {
        return dateExpirationLicence;
    }

    public void setDateExpirationLicence(LocalDate dateExpirationLicence) {
        this.dateExpirationLicence = dateExpirationLicence;
    }
}