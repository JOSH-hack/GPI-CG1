/*

Nom du fichier   : EquipementLogiciel.java
Objectif         : Entité JPA représentant le sous-type logiciel d'un équipement (heritage JOINED)
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "equipement_logiciel")
@PrimaryKeyJoinColumn(name = "id_equipement")
public class EquipementLogiciel extends Equipement {

    private String version;
    private Integer nombreLicences;
    private String cleLicence;
    private LocalDate dateDebutLicence;
    private LocalDate dateExpirationLicence;

    public EquipementLogiciel() {
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
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