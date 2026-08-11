/*

Nom du fichier   : Agent.java
Objectif         : Entité JPA représentant les agents
Propriétaire     : Josué BEDEL
Date de création : 11/08/2026
Date de mise à jour : 11/08/2026
Objet de mise à jour : Initialisation du modèle JPA

*/

package com.golfe1.gpi.entities;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "agent")
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAgent;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    private String fonction;
    private String telephone;

    @OneToOne
    @JoinColumn(name = "id_utilisateur", unique = true)
    private Utilisateur utilisateur;

    public Agent() {
    }

    public Agent(String nom, String prenom) {
        this.nom = nom;
        this.prenom = prenom;
    }

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

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Agent))
            return false;
        Agent agent = (Agent) o;
        return Objects.equals(idAgent, agent.idAgent);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idAgent);
    }

    @Override
    public String toString() {
        return "Agent{" +
                "idAgent=" + idAgent +
                ", nom='" + nom + '\'' +
                ", prenom='" + prenom + '\'' +
                ", fonction='" + fonction + '\'' +
                ", telephone='" + telephone + '\'' +
                '}';
    }
}
