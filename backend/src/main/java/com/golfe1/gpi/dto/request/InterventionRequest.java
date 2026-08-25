/*

Nom du fichier   : InterventionRequest.java
Objectif         : DTO de requête pour la création/modification d'une intervention
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.request;

import com.golfe1.gpi.entities.enums.ResultatIntervention;
import com.golfe1.gpi.entities.enums.TypeIntervention;
import jakarta.validation.constraints.NotNull;

public class InterventionRequest {

    @NotNull(message = "L'ID panne est obligatoire")
    private Long idPanne;

    @NotNull(message = "L'ID technicien est obligatoire")
    private Long idTechnicien;

    @NotNull(message = "Le type d'intervention est obligatoire")
    private TypeIntervention typeIntervention;

    private String diagnostic;
    private String solution;
    private String piecesRemplacees;
    private String rapport;
    private ResultatIntervention resultat;

    // Getters & Setters
    public Long getIdPanne() {
        return idPanne;
    }

    public void setIdPanne(Long idPanne) {
        this.idPanne = idPanne;
    }

    public Long getIdTechnicien() {
        return idTechnicien;
    }

    public void setIdTechnicien(Long idTechnicien) {
        this.idTechnicien = idTechnicien;
    }

    public TypeIntervention getTypeIntervention() {
        return typeIntervention;
    }

    public void setTypeIntervention(TypeIntervention typeIntervention) {
        this.typeIntervention = typeIntervention;
    }

    public String getDiagnostic() {
        return diagnostic;
    }

    public void setDiagnostic(String diagnostic) {
        this.diagnostic = diagnostic;
    }

    public String getSolution() {
        return solution;
    }

    public void setSolution(String solution) {
        this.solution = solution;
    }

    public String getPiecesRemplacees() {
        return piecesRemplacees;
    }

    public void setPiecesRemplacees(String piecesRemplacees) {
        this.piecesRemplacees = piecesRemplacees;
    }

    public String getRapport() {
        return rapport;
    }

    public void setRapport(String rapport) {
        this.rapport = rapport;
    }

    public ResultatIntervention getResultat() {
        return resultat;
    }

    public void setResultat(ResultatIntervention resultat) {
        this.resultat = resultat;
    }
}