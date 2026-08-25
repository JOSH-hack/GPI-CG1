/*

Nom du fichier   : MessageResponse.java
Objectif         : DTO de réponse pour un message (avec expéditeur)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.response;

import java.time.LocalDateTime;

public class MessageResponse {

    private Long idMessage;
    private String contenu;
    private LocalDateTime dateEnvoi;
    private UtilisateurResponse expediteur;

    // Getters & Setters
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

    public UtilisateurResponse getExpediteur() {
        return expediteur;
    }

    public void setExpediteur(UtilisateurResponse expediteur) {
        this.expediteur = expediteur;
    }
}