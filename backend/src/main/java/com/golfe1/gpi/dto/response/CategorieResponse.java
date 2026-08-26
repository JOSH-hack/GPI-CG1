/*

Nom du fichier   : CategorieResponse.java
Objectif         : DTO de réponse pour une catégorie
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.response;

import com.golfe1.gpi.entities.enums.TypeCategorie;

public class CategorieResponse {

    private Long idCategorie;
    private String libelle;
    private TypeCategorie type;

    // Getters & Setters
    public Long getIdCategorie() {
        return idCategorie;
    }

    public void setIdCategorie(Long idCategorie) {
        this.idCategorie = idCategorie;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public TypeCategorie getType() {
        return type;
    }

    public void setType(TypeCategorie type) {
        this.type = type;
    }
}