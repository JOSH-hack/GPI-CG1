/*

Nom du fichier   : EquipementMateriel.java
Objectif         : Entité JPA représentant le sous-type matériel d'un équipement (heritage JOINED)
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "equipement_materiel")
@PrimaryKeyJoinColumn(name = "id_equipement")
public class EquipementMateriel extends Equipement {

    private String processeur;
    private String ram;
    private String capaciteDisque;
    private String adresseIp;
    private String adresseMac;
    private String systemeExploitation;

    public EquipementMateriel() {
    }

    public String getProcesseur() {
        return processeur;
    }

    public void setProcesseur(String processeur) {
        this.processeur = processeur;
    }

    public String getRam() {
        return ram;
    }

    public void setRam(String ram) {
        this.ram = ram;
    }

    public String getCapaciteDisque() {
        return capaciteDisque;
    }

    public void setCapaciteDisque(String capaciteDisque) {
        this.capaciteDisque = capaciteDisque;
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

    public String getSystemeExploitation() {
        return systemeExploitation;
    }

    public void setSystemeExploitation(String systemeExploitation) {
        this.systemeExploitation = systemeExploitation;
    }
}