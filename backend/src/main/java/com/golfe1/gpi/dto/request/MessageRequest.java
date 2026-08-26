/*

Nom du fichier   : MessageRequest.java
Objectif         : DTO de requête pour l'envoi d'un message
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MessageRequest {

    @NotNull(message = "L'ID intervention est obligatoire")
    private Long idIntervention;

    @NotBlank(message = "Le contenu est obligatoire")
    private String contenu;

    // Getters & Setters
    public Long getIdIntervention() { return idIntervention; }
    public void setIdIntervention(Long idIntervention) { this.idIntervention = idIntervention; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }
}