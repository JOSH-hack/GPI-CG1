/*
Nom du fichier   : PieceJointe.java
Objectif         : Pièces jointes avec auto-destruction (4h ou 3 vues)
                   + suppression manuelle par le technicien
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026
*/

package com.golfe1.gpi.entities;

import com.golfe1.gpi.entities.enums.TypePieceJointe;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "piece_jointe")
public class PieceJointe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPieceJointe;

    @Column(nullable = false, length = 500)
    private String cheminFichier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypePieceJointe typeFichier;

    @Column(nullable = false)
    private Integer vuesRestantes = 3;

    @Column(nullable = false)
    private Integer vuesActuelles = 0;

    @Column(nullable = false)
    private Boolean supprimee = false;

    @Column(nullable = false)
    private Boolean supprimeeParTechnicien = false;

    @Column(nullable = false)
    private LocalDateTime dateUpload = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime dateExpiration;

    private LocalDateTime dateSuppression;

    @ManyToOne
    @JoinColumn(name = "id_panne", nullable = false)
    private Panne panne;

    public PieceJointe() {
    }

    // --- Méthode utilitaire : la pièce jointe est-elle encore accessible ? ---
    public boolean estAccessible() {
        if (supprimee || supprimeeParTechnicien)
            return false;
        if (vuesRestantes <= 0)
            return false;
        if (LocalDateTime.now().isAfter(dateExpiration))
            return false;
        return true;
    }

    // --- Getters & Setters ---

    public Long getIdPieceJointe() {
        return idPieceJointe;
    }

    public void setIdPieceJointe(Long idPieceJointe) {
        this.idPieceJointe = idPieceJointe;
    }

    public String getCheminFichier() {
        return cheminFichier;
    }

    public void setCheminFichier(String cheminFichier) {
        this.cheminFichier = cheminFichier;
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

    public LocalDateTime getDateSuppression() {
        return dateSuppression;
    }

    public void setDateSuppression(LocalDateTime dateSuppression) {
        this.dateSuppression = dateSuppression;
    }

    public Panne getPanne() {
        return panne;
    }

    public void setPanne(Panne panne) {
        this.panne = panne;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof PieceJointe))
            return false;
        PieceJointe that = (PieceJointe) o;
        return Objects.equals(idPieceJointe, that.idPieceJointe);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPieceJointe);
    }

    @Override
    public String toString() {
        return "PieceJointe{" +
                "idPieceJointe=" + idPieceJointe +
                ", typeFichier=" + typeFichier +
                ", vuesRestantes=" + vuesRestantes +
                ", supprimee=" + supprimee +
                ", supprimeeParTechnicien=" + supprimeeParTechnicien +
                ", dateExpiration=" + dateExpiration +
                '}';
    }
}