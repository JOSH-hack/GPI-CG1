/*

Nom du fichier   : MessageService.java
Objectif         : Logique métier du chat d'intervention à distance - envoi et consultation des messages échangés entre technicien et agent
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Intervention;
import com.golfe1.gpi.entities.Message;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.entities.enums.TypeIntervention;
import com.golfe1.gpi.repositories.InterventionRepository;
import com.golfe1.gpi.repositories.MessageRepository;
import com.golfe1.gpi.repositories.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final InterventionRepository interventionRepository;
    private final UtilisateurRepository utilisateurRepository;

    public MessageService(MessageRepository messageRepository,
            InterventionRepository interventionRepository,
            UtilisateurRepository utilisateurRepository) {
        this.messageRepository = messageRepository;
        this.interventionRepository = interventionRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    //  Envoi d'un message dans le chat d'une intervention a distance 
    // idExpediteur provient du JWT cote controleur, jamais d'un champ saisi toujours pour éviter l'usurpation d'identité
    
    @Transactional
    public Message envoyerMessage(Long idIntervention, Long idExpediteur, String contenu) {
        if (contenu == null || contenu.isBlank()) {
            throw new IllegalArgumentException("Le message ne peut pas etre vide");
        }

        Intervention intervention = interventionRepository.findById(idIntervention)
                .orElseThrow(() -> new IllegalArgumentException("Intervention introuvable : " + idIntervention));

        if (intervention.getTypeIntervention() != TypeIntervention.A_DISTANCE) {
            throw new IllegalStateException("Le chat n'est disponible que pour une intervention a distance");
        }

        Utilisateur expediteur = utilisateurRepository.findById(idExpediteur)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable : " + idExpediteur));

        Message message = new Message();
        message.setIntervention(intervention);
        message.setExpediteur(expediteur);
        message.setContenu(contenu);
        message.setDateEnvoi(LocalDateTime.now());

        return messageRepository.save(message);
    }

    // --- Consultation : historique du chat, dans l'ordre chronologique -------
    public List<Message> listerParIntervention(Long idIntervention) {
        return messageRepository.findByInterventionIdInterventionOrderByDateEnvoiAsc(idIntervention);
    }
}