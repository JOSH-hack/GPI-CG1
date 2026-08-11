/*

Nom du fichier   : Categorie.java
Objectif         : Entité JPA représentant les catégories d’équipements
Propriétaire     : Josué BEDEL
Date de création : 11/08/2026
Date de mise à jour : 11/08/2026
Objet de mise à jour : Initialisation du modèle JPA

*/

package com.golfe1.gpi.entities;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "categorie")
public class Categorie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCategorie;

    @Column(nullable = false, unique = true, length = 100)
    private String nom;

    private String description;

    public Categorie() {
    }

    public Categorie(String nom) {
        this.nom = nom;
    }

    public Long getIdCategorie() {
        return idCategorie;
    }

    public void setIdCategorie(Long idCategorie) {
        this.idCategorie = idCategorie;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Categorie))
            return false;
        Categorie that = (Categorie) o;
        return Objects.equals(idCategorie, that.idCategorie);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idCategorie);
    }

    @Override
    public String toString() {
        return "Categorie{" +
                "idCategorie=" + idCategorie +
                ", nom='" + nom + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
