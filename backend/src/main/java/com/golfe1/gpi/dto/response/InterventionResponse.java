/*

Nom du fichier   : InterventionResponse.java
Objectif         : DTO de réponse pour une intervention (avec panne, technicien, validateur)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.response;

import com.golfe1.gpi.entities.enums.ResultatIntervention;
import com.golfe1.gpi.entities.enums.TypeIntervention;

import java.time.LocalDateTime;

public class InterventionResponse {

    private Long idIntervention;
    private String diagnostic;
    private String solution;
    private String piecesRemplacees;
    private TypeIntervention typeIntervention;
    private ResultatIntervention resultat;
    private String rapport;
    private LocalDateTime dateIntervention;
    private LocalDateTime dateResolution;
    private LocalDateTime dateRapport;
    private LocalDateTime dateValidationDsi;
    private PanneResponse panne;
    private UtilisateurResponse technicien;
    private UtilisateurResponse validateurDsi;

    // Getters & Setters
    public Long getIdIntervention() {
        return idIntervention;
    }

    public void setIdIntervention(Long idIntervention) {
        this.idIntervention = idIntervention;
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

    public TypeIntervention getTypeIntervention() {
        return typeIntervention;
    }

    public void setTypeIntervention(TypeIntervention typeIntervention) {
        this.typeIntervention = typeIntervention;
    }

    public ResultatIntervention getResultat() {
        return resultat;
    }

    public void setResultat(ResultatIntervention resultat) {
        this.resultat = resultat;
    }

    public String getRapport() {
        return rapport;
    }

    public void setRapport(String rapport) {
        this.rapport = rapport;
    }

    public LocalDateTime getDateIntervention() {
        return dateIntervention;
    }

    public void setDateIntervention(LocalDateTime dateIntervention) {
        this.dateIntervention = dateIntervention;
    }

    public LocalDateTime getDateResolution() {
        return dateResolution;
    }

    public void setDateResolution(LocalDateTime dateResolution) {
        this.dateResolution = dateResolution;
    }

    public LocalDateTime getDateRapport() {
        return dateRapport;
    }

    public void setDateRapport(LocalDateTime dateRapport) {
        this.dateRapport = dateRapport;
    }

    public LocalDateTime getDateValidationDsi() {
        return dateValidationDsi;
    }

    public void setDateValidationDsi(LocalDateTime dateValidationDsi) {
        this.dateValidationDsi = dateValidationDsi;
    }

    public PanneResponse getPanne() {
        return panne;
    }

    public void setPanne(PanneResponse panne) {
        this.panne = panne;
    }

    public UtilisateurResponse getTechnicien() {
        return technicien;
    }

    public void setTechnicien(UtilisateurResponse technicien) {
        this.technicien = technicien;
    }

    public UtilisateurResponse getValidateurDsi() {
        return validateurDsi;
    }

    public void setValidateurDsi(UtilisateurResponse validateurDsi) {
        this.validateurDsi = validateurDsi;
    }
}