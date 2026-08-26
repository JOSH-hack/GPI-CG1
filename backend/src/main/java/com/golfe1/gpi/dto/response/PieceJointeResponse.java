/*

Nom du fichier   : PieceJointeResponse.java
Objectif         : DTO de réponse pour une pièce jointe (sans chemin fichier brut)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.response;

import com.golfe1.gpi.entities.enums.TypePieceJointe;

import java.time.LocalDateTime;

public class PieceJointeResponse {

    private Long idPieceJointe;
    private TypePieceJointe typeFichier;
    private Integer vuesRestantes;
    private Integer vuesActuelles;
    private Boolean supprimee;
    private Boolean supprimeeParTechnicien;
    private LocalDateTime dateUpload;
    private LocalDateTime dateExpiration;

    // Getters & Setters
    public Long getIdPieceJointe() {
        return idPieceJointe;
    }

    public void setIdPieceJointe(Long idPieceJointe) {
        this.idPieceJointe = idPieceJointe;
    }

    public TypePieceJointe getTypeFichier() {
        return typeFichier;
    }

    public void setTypeFichier(TypePieceJointe typeFichier) {
        this.typeFichier = typeFichier;
    }

    public Integer getVuesRestantes() {
        return vuesRestantes;
    }

    public void setVuesRestantes(Integer vuesRestantes) {
        this.vuesRestantes = vuesRestantes;
    }

    public Integer getVuesActuelles() {
        return vuesActuelles;
    }

    public void setVuesActuelles(Integer vuesActuelles) {
        this.vuesActuelles = vuesActuelles;
    }

    public Boolean getSupprimee() {
        return supprimee;
    }

    public void setSupprimee(Boolean supprimee) {
        this.supprimee = supprimee;
    }

    public Boolean getSupprimeeParTechnicien() {
        return supprimeeParTechnicien;
    }

    public void setSupprimeeParTechnicien(Boolean supprimeeParTechnicien) {
        this.supprimeeParTechnicien = supprimeeParTechnicien;
    }

    public LocalDateTime getDateUpload() {
        return dateUpload;
    }

    public void setDateUpload(LocalDateTime dateUpload) {
        this.dateUpload = dateUpload;
    }

    public LocalDateTime getDateExpiration() {
        return dateExpiration;
    }

    public void setDateExpiration(LocalDateTime dateExpiration) {
        this.dateExpiration = dateExpiration;
    }
}