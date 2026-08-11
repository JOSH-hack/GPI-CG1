/*

Nom du fichier   : Panne.java
Objectif         : Entité JPA représentant les pannes et incidents
Propriétaire     : Josué BEDEL
Date de création : 11/08/2026
Date de mise à jour : 11/08/2026
Objet de mise à jour : Initialisation du modèle JPA

*/

package com.golfe1.gpi.entities;

import com.golfe1.gpi.entities.enums.PrioritePanne;
import com.golfe1.gpi.entities.enums.StatutPanne;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "panne")
public class Panne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPanne;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDateTime dateSurvenance = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PrioritePanne priorite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutPanne statut = StatutPanne.SIGNALEE;

    private Integer noteSatisfaction;

    @ManyToOne
    @JoinColumn(name = "id_equipement", nullable = false)
    private Equipement equipement;

    @ManyToOne
    @JoinColumn(name = "id_utilisateur_signaleur", nullable = false)
    private Utilisateur utilisateurSignaleur;

    public Panne() {
    }

    public Long getIdPanne() {
        return idPanne;
    }

    public void setIdPanne(Long idPanne) {
        this.idPanne = idPanne;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDateSurvenance() {
        return dateSurvenance;
    }

    public void setDateSurvenance(LocalDateTime dateSurvenance) {
        this.dateSurvenance = dateSurvenance;
    }

    public PrioritePanne getPriorite() {
        return priorite;
    }

    public void setPriorite(PrioritePanne priorite) {
        this.priorite = priorite;
    }

    public StatutPanne getStatut() {
        return statut;
    }

    public void setStatut(StatutPanne statut) {
        this.statut = statut;
    }

    public Integer getNoteSatisfaction() {
        return noteSatisfaction;
    }

    public void setNoteSatisfaction(Integer noteSatisfaction) {
        this.noteSatisfaction = noteSatisfaction;
    }

    public Equipement getEquipement() {
        return equipement;
    }

    public void setEquipement(Equipement equipement) {
        this.equipement = equipement;
    }

    public Utilisateur getUtilisateurSignaleur() {
        return utilisateurSignaleur;
    }

    public void setUtilisateurSignaleur(Utilisateur utilisateurSignaleur) {
        this.utilisateurSignaleur = utilisateurSignaleur;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Panne))
            return false;
        Panne panne = (Panne) o;
        return Objects.equals(idPanne, panne.idPanne);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPanne);
    }

    @Override
    public String toString() {
        return "Panne{" +
                "idPanne=" + idPanne +
                ", description='" + description + '\'' +
                ", dateSurvenance=" + dateSurvenance +
                ", priorite=" + priorite +
                ", statut=" + statut +
                '}';
    }
}
