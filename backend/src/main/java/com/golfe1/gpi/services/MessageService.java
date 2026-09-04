/*

Nom du fichier   : MessageService.java
Objectif         : Logique métier du chat d'intervention à distance - 
                    envoi et consultation des messages échangés entre technicien et agent,
                    avec vérification que l'expéditeur est bien un participant de l'intervention
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Intervention;
import com.golfe1.gpi.entities.Message;
import com.golfe1.gpi.entities.Panne;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.entities.enums.TypeIntervention;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.exceptions.ResourceNotFoundException;
import com.golfe1.gpi.exceptions.UnauthorizedActionException;
import com.golfe1.gpi.repositories.InterventionRepository;
import com.golfe1.gpi.repositories.MessageRepository;
import com.golfe1.gpi.repositories.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.golfe1.gpi.entities.enums.RoleUtilisateur;

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

    //  ENVOI D'UN MESSAGE 
    // idExpediteur provient du JWT côté contrôleur, jamais d'un champ saisi.
    // Vérification que l'expéditeur est bien le technicien ou l'agent signaleur.

    @Transactional
    public Message envoyerMessage(Long idIntervention, Long idExpediteur, String contenu) {
        // Vérifier que l'expéditeur est bien un participant de l'intervention (les
        // admins outrepassent)
        Panne panne = intervention.getPanne();
        boolean estTechnicien = intervention.getTechnicien().getIdUtilisateur().equals(idExpediteur);
        boolean estSignaleur = panne.getUtilisateurSignaleur().getIdUtilisateur().equals(idExpediteur);
        RoleUtilisateur roleExpediteur = expediteur.getRole();
        boolean estAdmin = roleExpediteur == RoleUtilisateur.ADMIN_INFO
                || roleExpediteur == RoleUtilisateur.ADMIN_SYSTEME;

        if (!estTechnicien && !estSignaleur && !estAdmin) {
            throw new UnauthorizedActionException(
                    "Vous n'êtes pas autorisé à envoyer un message dans cette intervention");
        }
        
        if (contenu == null || contenu.isBlank()) {
            throw new BusinessRuleException("Le message ne peut pas être vide");
        }

        Intervention intervention = interventionRepository.findById(idIntervention)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention", idIntervention));

        if (intervention.getTypeIntervention() != TypeIntervention.A_DISTANCE) {
            throw new BusinessRuleException("Le chat n'est disponible que pour une intervention à distance");
        }

        Utilisateur expediteur = utilisateurRepository.findById(idExpediteur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", idExpediteur));

        // Vérifier que l'expéditeur est bien un participant de l'intervention
        Panne panne = intervention.getPanne();
        boolean estTechnicien = intervention.getTechnicien().getIdUtilisateur().equals(idExpediteur);
        boolean estSignaleur = panne.getUtilisateurSignaleur().getIdUtilisateur().equals(idExpediteur);

        if (!estTechnicien && !estSignaleur) {
            throw new UnauthorizedActionException(
                    "Vous n'êtes pas autorisé à envoyer un message dans cette intervention");
        }

        Message message = new Message();
        message.setIntervention(intervention);
        message.setExpediteur(expediteur);
        message.setContenu(contenu);
        message.setDateEnvoi(LocalDateTime.now());

        return messageRepository.save(message);
    }

    //  CONSULTATION 

    public List<Message> listerParIntervention(Long idIntervention) {
        return messageRepository.findByInterventionIdInterventionOrderByDateEnvoiAsc(idIntervention);
    }
}