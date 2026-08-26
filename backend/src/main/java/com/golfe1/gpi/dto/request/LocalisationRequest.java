/*

Nom du fichier   : LocalisationRequest.java
Objectif         : DTO de requête pour la création/modification d'une localisation
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.request;

import jakarta.validation.constraints.NotBlank;

public class LocalisationRequest {

    @NotBlank(message = "L'annexe est obligatoire")
    private String annexe;

    @NotBlank(message = "Le service est obligatoire")
    private String service;

    private String bureau;
    private String poste;

    // Getters & Setters
    public String getAnnexe() {
        return annexe;
    }

    public void setAnnexe(String annexe) {
        this.annexe = annexe;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getBureau() {
        return bureau;
    }

    public void setBureau(String bureau) {
        this.bureau = bureau;
    }

    public String getPoste() {
        return poste;
    }

    public void setPoste(String poste) {
        this.poste = poste;
    }
}