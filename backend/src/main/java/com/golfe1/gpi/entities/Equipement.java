/*

Nom du fichier   : Equipement.java
Objectif         : Entité JPA représentant les équipements informatiques
Propriétaire     : Josué BEDEL
Date de création : 11/08/2026
Date de mise à jour : 11/08/2026
Objet de mise à jour : Initialisation du modèle JPA

*/

package com.golfe1.gpi.entities;

import com.golfe1.gpi.entities.enums.StatutEquipement;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "equipement")
@Inheritance(strategy = InheritanceType.JOINED)
public class Equipement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEquipement;

    @Column(nullable = false, unique = true, length = 50)
    private String codeInventaire;

    private String numeroSerie;
    private String nom;
    private String marque;
    private String modele;
    private LocalDate dateAcquisition;
    private LocalDate finGarantie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutEquipement statut;

    private Double coutAcquisition;

    @ManyToOne
    @JoinColumn(name = "id_categorie", nullable = false)
    private Categorie categorie;

    @ManyToOne
    @JoinColumn(name = "id_localisation", nullable = false)
    private Localisation localisation;

    @ManyToOne
    @JoinColumn(name = "id_agent")
    private Agent agent;

    public Equipement() {
    }

    public Long getIdEquipement() {
        return idEquipement;
    }

    public void setIdEquipement(Long idEquipement) {
        this.idEquipement = idEquipement;
    }

    public String getCodeInventaire() {
        return codeInventaire;
    }

    public void setCodeInventaire(String codeInventaire) {
        this.codeInventaire = codeInventaire;
    }

    public String getNumeroSerie() {
        return numeroSerie;
    }

    public void setNumeroSerie(String numeroSerie) {
        this.numeroSerie = numeroSerie;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public String getModele() {
        return modele;
    }

    public void setModele(String modele) {
        this.modele = modele;
    }

    public LocalDate getDateAcquisition() {
        return dateAcquisition;
    }

    public void setDateAcquisition(LocalDate dateAcquisition) {
        this.dateAcquisition = dateAcquisition;
    }

    public LocalDate getFinGarantie() {
        return finGarantie;
    }

    public void setFinGarantie(LocalDate finGarantie) {
        this.finGarantie = finGarantie;
    }

    public StatutEquipement getStatut() {
        return statut;
    }

    public void setStatut(StatutEquipement statut) {
        this.statut = statut;
    }

    public Double getCoutAcquisition() {
        return coutAcquisition;
    }

    public void setCoutAcquisition(Double coutAcquisition) {
        this.coutAcquisition = coutAcquisition;
    }

    public Categorie getCategorie() {
        return categorie;
    }

    public void setCategorie(Categorie categorie) {
        this.categorie = categorie;
    }

    public Localisation getLocalisation() {
        return localisation;
    }

    public void setLocalisation(Localisation localisation) {
        this.localisation = localisation;
    }

    public Agent getAgent() {
        return agent;
    }

    public void setAgent(Agent agent) {
        this.agent = agent;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Equipement))
            return false;
        Equipement that = (Equipement) o;
        return Objects.equals(idEquipement, that.idEquipement);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idEquipement);
    }

    @Override
    public String toString() {
        return "Equipement{" +
                "idEquipement=" + idEquipement +
                ", codeInventaire='" + codeInventaire + '\'' +
                ", nom='" + nom + '\'' +
                ", statut=" + statut +
                '}';
    }
}
