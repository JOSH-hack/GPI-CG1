/*

Nom du fichier   : HistoriqueMouvement.java
Objectif         : Entité JPA représentant les mouvements des équipements
Propriétaire     : Josué BEDEL
Date de création : 11/08/2026
Date de mise à jour : 24/08/2026
Objet de mise à jour : Alignement avec schema.sql final - ajout de ancienneValeur/nouvelleValeur, "type" renommé "typeMouvement", correction du nom de colonne de l'opérateur

*/

package com.golfe1.gpi.entities;

import com.golfe1.gpi.entities.enums.TypeMouvement;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "historique_mouvement")
public class HistoriqueMouvement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMouvement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TypeMouvement typeMouvement;

    @Column(nullable = false, length = 255)
    private String motif;

    private String ancienneValeur;
    private String nouvelleValeur;

    @Column(nullable = false)
    private LocalDateTime dateMouvement = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "id_equipement", nullable = false)
    private Equipement equipement;

    @ManyToOne
    @JoinColumn(name = "id_utilisateur_operateur", nullable = false)
    private Utilisateur operateur;

    public HistoriqueMouvement() {
    }

    public Long getIdMouvement() {
        return idMouvement;
    }

    public void setIdMouvement(Long idMouvement) {
        this.idMouvement = idMouvement;
    }

    public TypeMouvement getTypeMouvement() {
        return typeMouvement;
    }

    public void setTypeMouvement(TypeMouvement typeMouvement) {
        this.typeMouvement = typeMouvement;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public String getAncienneValeur() {
        return ancienneValeur;
    }

    public void setAncienneValeur(String ancienneValeur) {
        this.ancienneValeur = ancienneValeur;
    }

    public String getNouvelleValeur() {
        return nouvelleValeur;
    }

    public void setNouvelleValeur(String nouvelleValeur) {
        this.nouvelleValeur = nouvelleValeur;
    }

    public LocalDateTime getDateMouvement() {
        return dateMouvement;
    }

    public void setDateMouvement(LocalDateTime dateMouvement) {
        this.dateMouvement = dateMouvement;
    }

    public Equipement getEquipement() {
        return equipement;
    }

    public void setEquipement(Equipement equipement) {
        this.equipement = equipement;
    }

    public Utilisateur getOperateur() {
        return operateur;
    }

    public void setOperateur(Utilisateur operateur) {
        this.operateur = operateur;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof HistoriqueMouvement))
            return false;
        HistoriqueMouvement that = (HistoriqueMouvement) o;
        return Objects.equals(idMouvement, that.idMouvement);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idMouvement);
    }

    @Override
    public String toString() {
        return "HistoriqueMouvement{" +
                "idMouvement=" + idMouvement +
                ", typeMouvement=" + typeMouvement +
                ", motif='" + motif + '\'' +
                ", dateMouvement=" + dateMouvement +
                '}';
    }
}