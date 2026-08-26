/*

Nom du fichier   : EquipementReseauResponse.java
Objectif         : DTO de réponse spécifique au matériel réseau
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.response;

import com.golfe1.gpi.entities.enums.TypeAdresseReseau;

public class EquipementReseauResponse extends EquipementResponse {

    private TypeAdresseReseau typeAdresse;
    private String adresseIp;
    private String masqueSousReseau;
    private String passerelle;
    private String dns;
    private String nomHote;
    private Integer nombrePorts;

    // Getters & Setters
    public TypeAdresseReseau getTypeAdresse() {
        return typeAdresse;
    }

    public void setTypeAdresse(TypeAdresseReseau typeAdresse) {
        this.typeAdresse = typeAdresse;
    }

    public String getAdresseIp() {
        return adresseIp;
    }

    public void setAdresseIp(String adresseIp) {
        this.adresseIp = adresseIp;
    }

    public String getMasqueSousReseau() {
        return masqueSousReseau;
    }

    public void setMasqueSousReseau(String masqueSousReseau) {
        this.masqueSousReseau = masqueSousReseau;
    }

    public String getPasserelle() {
        return passerelle;
    }

    public void setPasserelle(String passerelle) {
        this.passerelle = passerelle;
    }

    public String getDns() {
        return dns;
    }

    public void setDns(String dns) {
        this.dns = dns;
    }

    public String getNomHote() {
        return nomHote;
    }

    public void setNomHote(String nomHote) {
        this.nomHote = nomHote;
    }

    public Integer getNombrePorts() {
        return nombrePorts;
    }

    public void setNombrePorts(Integer nombrePorts) {
        this.nombrePorts = nombrePorts;
    }
}