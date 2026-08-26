/*

Nom du fichier   : AgentService.java
Objectif         : Logique métier des agents - création, modification,
                    liaison avec un compte utilisateur, consultation
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Agent;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.exceptions.ResourceNotFoundException;
import com.golfe1.gpi.repositories.AgentRepository;
import com.golfe1.gpi.repositories.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AgentService {

    private final AgentRepository agentRepository;
    private final UtilisateurRepository utilisateurRepository;

    public AgentService(AgentRepository agentRepository, UtilisateurRepository utilisateurRepository) {
        this.agentRepository = agentRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional
    public Agent creerAgent(String nom, String prenom, String fonction, String telephone,
            String email, Long idUtilisateur) {
        if (agentRepository.findByUtilisateurIdUtilisateur(idUtilisateur).isPresent()) {
            throw new BusinessRuleException("Cet utilisateur est déjà lié à un agent");
        }

        Utilisateur utilisateur = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", idUtilisateur));

        Agent agent = new Agent();
        agent.setNom(nom);
        agent.setPrenom(prenom);
        agent.setFonction(fonction);
        agent.setTelephone(telephone);
        agent.setUtilisateur(utilisateur);

        return agentRepository.save(agent);
    }

    @Transactional
    public Agent modifierAgent(Long idAgent, String nom, String prenom, String fonction, String telephone) {
        Agent agent = getAgentOuException(idAgent);
        agent.setNom(nom);
        agent.setPrenom(prenom);
        agent.setFonction(fonction);
        agent.setTelephone(telephone);
        return agentRepository.save(agent);
    }

    public List<Agent> listerTous() {
        return agentRepository.findAll();
    }

    public Agent getParId(Long idAgent) {
        return getAgentOuException(idAgent);
    }

    public Agent getParUtilisateur(Long idUtilisateur) {
        return agentRepository.findByUtilisateurIdUtilisateur(idUtilisateur)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Agent", "idUtilisateur", String.valueOf(idUtilisateur)));
    }

    public List<Agent> rechercherParNom(String nom) {
        return agentRepository.findByNomContainingIgnoreCase(nom);
    }

    private Agent getAgentOuException(Long idAgent) {
        return agentRepository.findById(idAgent)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", idAgent));
    }
}