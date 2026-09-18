/*

Nom du fichier   : ChatWebSocketController.java
Objectif         : Réception des messages du chat d'intervention à distance via WebSocket - persiste via MessageService puis diffuse en temps réel aux abonnés du topic de l'intervention
Propriétaire     : Josué BEDEL
Date de création : 26/08/2026

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.MessageMapper;
import com.golfe1.gpi.dto.response.MessageResponse;
import com.golfe1.gpi.entities.Message;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.services.MessageService;
import com.golfe1.gpi.services.UtilisateurService;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;


@Controller
public class ChatWebSocketController {

    private final MessageService messageService;
    private final UtilisateurService utilisateurService;
    private final MessageMapper messageMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(MessageService messageService,
            UtilisateurService utilisateurService,
            MessageMapper messageMapper,
            SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.utilisateurService = utilisateurService;
        this.messageMapper = messageMapper;
        this.messagingTemplate = messagingTemplate;
    }

    // Le frontend envoie sur : /app/intervention/{idIntervention}/chat
    // avec le header STOMP "Authorization: Bearer <token>" pose au CONNECT.
    @MessageMapping("/intervention/{idIntervention}/chat")
    public void envoyerMessage(@DestinationVariable Long idIntervention,
            ChatPayload payload,
            Principal principal) {

        String email = principal.getName();
        Utilisateur expediteur = utilisateurService.getParEmail(email);

        Message message = messageService.envoyerMessage(idIntervention, expediteur.getIdUtilisateur(),
                payload.getContenu());

        MessageResponse response = messageMapper.toResponse(message);

        messagingTemplate.convertAndSend("/topic/intervention/" + idIntervention, response);
    }
    
    // Notification ephemere "en train d'ecrire" - jamais persistee, juste
    // rediffusee aux abonnes du topic de frappe de cette intervention.
    @MessageMapping("/intervention/{idIntervention}/typing")
    public void notifierEnTrainDecrire(@DestinationVariable Long idIntervention, Principal principal) {
        String email = principal.getName();
        Utilisateur expediteur = utilisateurService.getParEmail(email);

        TypingPayload payload = new TypingPayload();
        payload.setIdUtilisateur(expediteur.getIdUtilisateur());
        payload.setNom(expediteur.getNom());
        payload.setPrenom(expediteur.getPrenom());

        messagingTemplate.convertAndSend("/topic/intervention/" + idIntervention + "/typing", payload);
    }

    // Payload ephemere envoye aux abonnes quand quelqu'un est en train d'ecrire.
    public static class TypingPayload {
        private Long idUtilisateur;
        private String nom;
        private String prenom;

        public Long getIdUtilisateur() {
            return idUtilisateur;
        }

        public void setIdUtilisateur(Long idUtilisateur) {
            this.idUtilisateur = idUtilisateur;
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
    }

    // Payload minimal recu du frontend - juste le contenu du message.
    public static class ChatPayload {
        private String contenu;

        public String getContenu() {
            return contenu;
        }

        public void setContenu(String contenu) {
            this.contenu = contenu;
        }
    }
}