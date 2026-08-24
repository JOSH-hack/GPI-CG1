/*

Nom du fichier   : Message.java
Objectif         : Entité JPA représentant les messages du chat d'une intervention à distance
Propriétaire     : Josué BEDEL
Date de création : 11/08/2026
Date de mise à jour : 24/08/2026
Objet de mise à jour : Alignement avec schema.sql final - "destinataire" retiré (absent de la table), ajout du lien vers "intervention" (chat rattaché à l'intervention, pas point-à-point), correction du nom de colonne de l'expéditeur

*/

package com.golfe1.gpi.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "message")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMessage;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @Column(nullable = false)
    private LocalDateTime dateEnvoi = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "id_intervention", nullable = false)
    private Intervention intervention;

    @ManyToOne
    @JoinColumn(name = "id_utilisateur_expediteur", nullable = false)
    private Utilisateur expediteur;

    public Message() {
    }

    public Long getIdMessage() {
        return idMessage;
    }

    public void setIdMessage(Long idMessage) {
        this.idMessage = idMessage;
    }

    public String getContenu() {
        return contenu;
    }

    public void setContenu(String contenu) {
        this.contenu = contenu;
    }

    public LocalDateTime getDateEnvoi() {
        return dateEnvoi;
    }

    public void setDateEnvoi(LocalDateTime dateEnvoi) {
        this.dateEnvoi = dateEnvoi;
    }

    public Intervention getIntervention() {
        return intervention;
    }

    public void setIntervention(Intervention intervention) {
        this.intervention = intervention;
    }

    public Utilisateur getExpediteur() {
        return expediteur;
    }

    public void setExpediteur(Utilisateur expediteur) {
        this.expediteur = expediteur;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Message))
            return false;
        Message message = (Message) o;
        return Objects.equals(idMessage, message.idMessage);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idMessage);
    }

    @Override
    public String toString() {
        return "Message{" +
                "idMessage=" + idMessage +
                ", contenu='" + contenu + '\'' +
                ", dateEnvoi=" + dateEnvoi +
                '}';
    }
}