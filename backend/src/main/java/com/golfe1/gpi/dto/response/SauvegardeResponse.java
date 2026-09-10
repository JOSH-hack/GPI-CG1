/*

Nom du fichier   : SauvegardeResponse.java
Objectif         : DTO de reponse pour une sauvegarde - evite d'exposer
                    l'entite Utilisateur (et son mot de passe hache) via le
                    champ operateur
Propriétaire     : Josué BEDEL
Date de création : 10/09/2026

*/

package com.golfe1.gpi.dto.response;

import com.golfe1.gpi.entities.enums.DeclencheurSauvegarde;
import com.golfe1.gpi.entities.enums.StatutSauvegarde;
import java.time.LocalDateTime;

public class SauvegardeResponse {

    private Long idSauvegarde;
    private LocalDateTime dateSauvegarde;
    private Long tailleOctets;
    private StatutSauvegarde statut;
    private DeclencheurSauvegarde declencheur;
    private String operateurNom;
    private String messageErreur;

    public Long getIdSauvegarde() {
        return idSauvegarde;
    }

    public void setIdSauvegarde(Long idSauvegarde) {
        this.idSauvegarde = idSauvegarde;
    }

    public LocalDateTime getDateSauvegarde() {
        return dateSauvegarde;
    }

    public void setDateSauvegarde(LocalDateTime dateSauvegarde) {
        this.dateSauvegarde = dateSauvegarde;
    }

    public Long getTailleOctets() {
        return tailleOctets;
    }

    public void setTailleOctets(Long tailleOctets) {
        this.tailleOctets = tailleOctets;
    }

    public StatutSauvegarde getStatut() {
        return statut;
    }

    public void setStatut(StatutSauvegarde statut) {
        this.statut = statut;
    }

    public DeclencheurSauvegarde getDeclencheur() {
        return declencheur;
    }

    public void setDeclencheur(DeclencheurSauvegarde declencheur) {
        this.declencheur = declencheur;
    }

    public String getOperateurNom() {
        return operateurNom;
    }

    public void setOperateurNom(String operateurNom) {
        this.operateurNom = operateurNom;
    }

    public String getMessageErreur() {
        return messageErreur;
    }

    public void setMessageErreur(String messageErreur) {
        this.messageErreur = messageErreur;
    }
}