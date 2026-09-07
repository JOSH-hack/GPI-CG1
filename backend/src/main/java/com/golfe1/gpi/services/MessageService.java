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

        // Vérifier que le contenu n'est pas vide
        if (contenu == null || contenu.isBlank()) {
            throw new BusinessRuleException("Le message ne peut pas être vide");
        }

        // Récupérer l'intervention
        Intervention intervention = interventionRepository.findById(idIntervention)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention", idIntervention));

        // Le chat est disponible uniquement pour les interventions à distance
        if (intervention.getTypeIntervention() != TypeIntervention.A_DISTANCE) {
            throw new BusinessRuleException(
                    "Le chat n'est disponible que pour une intervention à distance");
        }

        // Récupérer l'expéditeur
        Utilisateur expediteur = utilisateurRepository.findById(idExpediteur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", idExpediteur));

        // Récupérer la panne liée à l'intervention
        Panne panne = intervention.getPanne();

        // Vérifier si l'expéditeur est le technicien assigné
        boolean estTechnicien = intervention.getTechnicien() != null
                && intervention.getTechnicien().getIdUtilisateur().equals(idExpediteur);

        // Vérifier si l'expéditeur est l'agent qui a signalé la panne
        boolean estSignaleur = panne != null
                && panne.getUtilisateurSignaleur() != null
                && panne.getUtilisateurSignaleur().getIdUtilisateur().equals(idExpediteur);

        // Vérifier si l'expéditeur est un administrateur autorisé
        RoleUtilisateur roleExpediteur = expediteur.getRole();

        boolean estAdmin = roleExpediteur == RoleUtilisateur.ADMIN_INFO
                || roleExpediteur == RoleUtilisateur.ADMIN_SYSTEME;

        // Vérifier l'autorisation
        if (!estTechnicien && !estSignaleur && !estAdmin) {
            throw new UnauthorizedActionException(
                    "Vous n'êtes pas autorisé à envoyer un message dans cette intervention");
        }

        // Créer le message
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