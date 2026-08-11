/*

Nom du fichier   : Intervention.java
Objectif         : Entité JPA représentant les interventions techniques
Propriétaire     : Josué BEDEL
Date de création : 11/08/2026
Date de mise à jour : 11/08/2026
Objet de mise à jour : Initialisation du modèle JPA

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

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDateTime dateIntervention = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private TypeIntervention type;

    @Enumerated(EnumType.STRING)
    private ResultatIntervention resultat;

    @ManyToOne
    @JoinColumn(name = "id_panne", nullable = false)
    private Panne panne;

    @ManyToOne
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur technicien;

    public Intervention() {
    }

    public Long getIdIntervention() {
        return idIntervention;
    }

    public void setIdIntervention(Long idIntervention) {
        this.idIntervention = idIntervention;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDateIntervention() {
        return dateIntervention;
    }

    public void setDateIntervention(LocalDateTime dateIntervention) {
        this.dateIntervention = dateIntervention;
    }

    public TypeIntervention getType() {
        return type;
    }

    public void setType(TypeIntervention type) {
        this.type = type;
    }

    public ResultatIntervention getResultat() {
        return resultat;
    }

    public void setResultat(ResultatIntervention resultat) {
        this.resultat = resultat;
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
                ", description='" + description + '\'' +
                ", type=" + type +
                ", resultat=" + resultat +
                '}';
    }
}
