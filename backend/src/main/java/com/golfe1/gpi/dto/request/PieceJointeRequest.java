/*

Nom du fichier   : PieceJointeRequest.java
Objectif         : DTO de requête pour l'upload d'une pièce jointe
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.request;

import com.golfe1.gpi.entities.enums.TypePieceJointe;
import jakarta.validation.constraints.NotNull;

public class PieceJointeRequest {

    @NotNull(message = "L'ID panne est obligatoire")
    private Long idPanne;

    @NotNull(message = "Le type de fichier est obligatoire")
    private TypePieceJointe typeFichier;

    // Le chemin fichier sera généré côté service après upload
    // Getters & Setters
    public Long getIdPanne() { return idPanne; }
    public void setIdPanne(Long idPanne) { this.idPanne = idPanne; }

    public TypePieceJointe getTypeFichier() { return typeFichier; }
    public void setTypeFichier(TypePieceJointe typeFichier) { this.typeFichier = typeFichier; }
}