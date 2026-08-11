/*

Nom du fichier   : HistoriqueMouvement.java
Objectif         : Entité JPA représentant les mouvements des équipements
Propriétaire     : Josué BEDEL
Date de création : 11/08/2026
Date de mise à jour : 11/08/2026
Objet de mise à jour : Initialisation du modèle JPA

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
    private TypeMouvement type;

    private String motif;
    private LocalDateTime dateMouvement = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "id_equipement", nullable = false)
    private Equipement equipement;

    @ManyToOne
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur operateur;

    public HistoriqueMouvement() {
    }

    public Long getIdMouvement() {
        return idMouvement;
    }

    public void setIdMouvement(Long idMouvement) {
        this.idMouvement = idMouvement;
    }

    public TypeMouvement getType() {
        return type;
    }

    public void setType(TypeMouvement type) {
        this.type = type;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
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
                ", type=" + type +
                ", motif='" + motif + '\'' +
                ", dateMouvement=" + dateMouvement +
                '}';
    }
}
