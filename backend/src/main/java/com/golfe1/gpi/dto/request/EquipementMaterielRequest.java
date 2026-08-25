/*

Nom du fichier   : EquipementMaterielRequest.java
Objectif         : DTO de requête spécifique au matériel informatique
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.request;

public class EquipementMaterielRequest extends EquipementRequest {

    private String processeur;
    private String ram;
    private String capaciteDisque;
    private String adresseIp;
    private String adresseMac;
    private String systemeExploitation;

    // Getters & Setters
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