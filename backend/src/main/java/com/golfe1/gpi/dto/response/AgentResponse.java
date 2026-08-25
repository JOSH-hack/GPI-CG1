/*

Nom du fichier   : AgentResponse.java
Objectif         : DTO de réponse pour un agent
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.response;

public class AgentResponse {

    private Long idAgent;
    private String nom;
    private String prenom;
    private String fonction;
    private String telephone;
    private String email;
    private UtilisateurResponse utilisateur;

    // Getters & Setters
    public Long getIdAgent() {
        return idAgent;
    }

    public void setIdAgent(Long idAgent) {
        this.idAgent = idAgent;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getFonction() {
        return fonction;
    }

    public void setFonction(String fonction) {
        this.fonction = fonction;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public UtilisateurResponse getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(UtilisateurResponse utilisateur) {
        this.utilisateur = utilisateur;
    }
}