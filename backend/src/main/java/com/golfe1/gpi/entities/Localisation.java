/*

Nom du fichier   : Localisation.java
Objectif         : Entité JPA représentant les localisations géographiques et administratives
Propriétaire     : Josué BEDEL
Date de création : 11/08/2026
Date de mise à jour : 11/08/2026
Objet de mise à jour : Initialisation du modèle JPA

*/

package com.golfe1.gpi.entities;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "localisation")
public class Localisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLocalisation;

    @Column(nullable = false, length = 150)
    private String site;

    private String service;
    private String bureau;

    public Localisation() {
    }

    public Localisation(String site) {
        this.site = site;
    }

    public Long getIdLocalisation() {
        return idLocalisation;
    }

    public void setIdLocalisation(Long idLocalisation) {
        this.idLocalisation = idLocalisation;
    }

    public String getSite() {
        return site;
    }

    public void setSite(String site) {
        this.site = site;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getBureau() {
        return bureau;
    }

    public void setBureau(String bureau) {
        this.bureau = bureau;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Localisation))
            return false;
        Localisation that = (Localisation) o;
        return Objects.equals(idLocalisation, that.idLocalisation);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idLocalisation);
    }

    @Override
    public String toString() {
        return "Localisation{" +
                "idLocalisation=" + idLocalisation +
                ", site='" + site + '\'' +
                ", service='" + service + '\'' +
                ", bureau='" + bureau + '\'' +
                '}';
    }
}
