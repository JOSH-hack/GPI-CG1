/*

Nom du fichier   : PanneRequest.java
Objectif         : DTO de requête pour la création d'une panne
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.request;

import com.golfe1.gpi.entities.enums.PrioritePanne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PanneRequest {

    @NotNull(message = "L'ID équipement est obligatoire")
    private Long idEquipement;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "La priorité est obligatoire")
    private PrioritePanne priorite;

    // Getters & Setters
    public Long getIdEquipement() {
        return idEquipement;
    }

    public void setIdEquipement(Long idEquipement) {
        this.idEquipement = idEquipement;
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
}