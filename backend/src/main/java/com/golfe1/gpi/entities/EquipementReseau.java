/*

Nom du fichier   : EquipementReseau.java
Objectif         : Entité JPA représentant le sous-type réseau d'un équipement (heritage JOINED)
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.entities;

import com.golfe1.gpi.entities.enums.TypeAdresseReseau;
import jakarta.persistence.*;

@Entity
@Table(name = "equipement_reseau")
@PrimaryKeyJoinColumn(name = "id_equipement")
public class EquipementReseau extends Equipement {

    private String adresseIp;
    private String adresseMac;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeAdresseReseau typeAdresse;

    private String nomHote;
    private String passerelle;
    private String masque;
    private Integer nombrePorts;

    public EquipementReseau() {
    }

    public String getAdresseIp() {
        return adresseIp;
    }

    public void setAdresseIp(String adresseIp) {
        this.adresseIp = adresseIp;
    }

    public String getAdresseMac() {
        return adresseMac;
    }

    public void setAdresseMac(String adresseMac) {
        this.adresseMac = adresseMac;
    }

    public TypeAdresseReseau getTypeAdresse() {
        return typeAdresse;
    }

    public void setTypeAdresse(TypeAdresseReseau typeAdresse) {
        this.typeAdresse = typeAdresse;
    }

    public String getNomHote() {
        return nomHote;
    }

    public void setNomHote(String nomHote) {
        this.nomHote = nomHote;
    }

    public String getPasserelle() {
        return passerelle;
    }

    public void setPasserelle(String passerelle) {
        this.passerelle = passerelle;
    }

    public String getMasque() {
        return masque;
    }

    public void setMasque(String masque) {
        this.masque = masque;
    }

    public Integer getNombrePorts() {
        return nombrePorts;
    }

    public void setNombrePorts(Integer nombrePorts) {
        this.nombrePorts = nombrePorts;
    }
}