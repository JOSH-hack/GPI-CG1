/*

Nom du fichier   : Intervention.java
Objectif         : Entité JPA représentant les interventions techniques
Propriétaire     : Josué BEDEL
Date de création : 11/08/2026
Date de mise à jour : 24/08/2026
Objet de mise à jour : Alignement avec schema.sql final - "description" retiré (remplacé par diagnostic/solution), ajout de piecesRemplacees/dateResolution/rapport/dateRapport/dateValidationDsi/validateurDsi, "type" renommé "typeIntervention", correction du nom de colonne pour le technicien (id_utilisateur_technicien)

*/

package com.golfe1.gpi.entities;

import com.golfe1.gpi.entities.enums.TypeIntervention;
import com.golfe1.gpi.entities.enums.ResultatIntervention;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "intervention")
public class Intervention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idIntervention;

    @Column(columnDefinition = "TEXT")
    private String diagnostic;

    @Column(columnDefinition = "TEXT")
    private String solution;

    @Column(columnDefinition = "TEXT")
    private String piecesRemplacees;

    @Column(nullable = false)
    private LocalDateTime dateIntervention = LocalDateTime.now();

    private LocalDateTime dateResolution;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeIntervention typeIntervention;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ResultatIntervention resultat;

    @Column(columnDefinition = "TEXT")
    private String rapport;

    private LocalDateTime dateRapport;
    private LocalDateTime dateValidationDsi;

    @ManyToOne
    @JoinColumn(name = "id_panne", nullable = false)
    private Panne panne;

    @ManyToOne
    @JoinColumn(name = "id_utilisateur_technicien", nullable = false)
    private Utilisateur technicien;

    @ManyToOne
    @JoinColumn(name = "id_utilisateur_validateur_dsi")
    private Utilisateur validateurDsi;

    public Intervention() {
    }

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

    public Panne getPanne() {
        return panne;
    }

    public void setPanne(Panne panne) {
        this.panne = panne;
    }

    public Utilisateur getTechnicien() {
        return technicien;
    }

    public void setTechnicien(Utilisateur technicien) {
        this.technicien = technicien;
    }

    public Utilisateur getValidateurDsi() {
        return validateurDsi;
    }

    public void setValidateurDsi(Utilisateur validateurDsi) {
        this.validateurDsi = validateurDsi;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Intervention))
            return false;
        Intervention that = (Intervention) o;
        return Objects.equals(idIntervention, that.idIntervention);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idIntervention);
    }

    @Override
    public String toString() {
        return "Intervention{" +
                "idIntervention=" + idIntervention +
                ", typeIntervention=" + typeIntervention +
                ", resultat=" + resultat +
                '}';
    }
}