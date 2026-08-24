/*

Nom du fichier   : Categorie.java
Objectif         : Entité JPA représentant les catégories d'équipements
Propriétaire     : Josué BEDEL
Date de création : 11/08/2026
Date de mise à jour : 24/08/2026
Objet de mise à jour : Alignement avec schema.sql final - "nom" renommé "libelle", 
                    "description" retiré (absent de la table), ajout du champ obligatoire "type" (enum TypeCategorie)

*/

package com.golfe1.gpi.entities;

import com.golfe1.gpi.entities.enums.TypeCategorie;
import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "categorie")
public class Categorie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCategorie;

    @Column(nullable = false, length = 100)
    private String libelle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeCategorie type;

    public Categorie() {
    }

    public Categorie(String libelle, TypeCategorie type) {
        this.libelle = libelle;
        this.type = type;
    }

    public Long getIdCategorie() {
        return idCategorie;
    }

    public void setIdCategorie(Long idCategorie) {
        this.idCategorie = idCategorie;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public TypeCategorie getType() {
        return type;
    }

    public void setType(TypeCategorie type) {
        this.type = type;
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
                ", libelle='" + libelle + '\'' +
                ", type=" + type +
                '}';
    }
}