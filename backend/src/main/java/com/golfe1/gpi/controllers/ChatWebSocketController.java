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
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
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
            Authentication authentication) {

        // L'identite de l'expediteur vient du token JWT valide au CONNECT,
        // jamais du payload envoye par le client - meme principe que pour idSignaleur.
        String email = authentication.getName();
        Utilisateur expediteur = utilisateurService.getParEmail(email);

        Message message = messageService.envoyerMessage(idIntervention, expediteur.getIdUtilisateur(),
                payload.getContenu());

        // ADAPTER ICI si votre MessageMapper utilise un autre nom de methode
        MessageResponse response = messageMapper.toResponse(message);

        // Diffuse a tous les abonnes de ce topic (technicien + agent signaleur)
        messagingTemplate.convertAndSend("/topic/intervention/" + idIntervention, response);
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