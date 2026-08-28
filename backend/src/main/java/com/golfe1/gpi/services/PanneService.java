/*

Nom du fichier   : PanneService.java
Objectif         : Logique métier des pannes - signalement, consultation, notation,
                    reforme (délégation à EquipementService pour la mise au rebut)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026
Date de mise à jour : 25/08/2026
Objet de mise à jour : reformerPanne() délègue la mise au rebut à EquipementService
                       pour garantir la traçabilité unique (RG-04)

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Equipement;
import com.golfe1.gpi.entities.Panne;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.entities.enums.PrioritePanne;
import com.golfe1.gpi.entities.enums.StatutPanne;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.exceptions.ResourceNotFoundException;
import com.golfe1.gpi.repositories.EquipementRepository;
import com.golfe1.gpi.repositories.PanneRepository;
import com.golfe1.gpi.repositories.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PanneService {

    private final PanneRepository panneRepository;
    private final EquipementRepository equipementRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EquipementService equipementService;

    public PanneService(PanneRepository panneRepository,
            EquipementRepository equipementRepository,
            UtilisateurRepository utilisateurRepository,
            EquipementService equipementService) {
        this.panneRepository = panneRepository;
        this.equipementRepository = equipementRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.equipementService = equipementService;
    }

    // SIGNALEMENT DE PANNE

    @Transactional
    public Panne signalerPanne(Long idEquipement, Long idSignaleur, String description, PrioritePanne priorite) {
        Equipement equipement = equipementRepository.findById(idEquipement)
                .orElseThrow(() -> new ResourceNotFoundException("Equipement", idEquipement));
        Utilisateur signaleur = utilisateurRepository.findById(idSignaleur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", idSignaleur));

        Panne panne = new Panne();
        panne.setEquipement(equipement);
        panne.setUtilisateurSignaleur(signaleur);
        panne.setDescription(description);
        panne.setPriorite(priorite);
        panne.setStatut(StatutPanne.SIGNALEE);
        panne.setDateSurvenance(LocalDateTime.now());

        return panneRepository.save(panne);
    }

    // NOTATION DE SATISFACTION

    @Transactional
    public Panne noterSatisfaction(Long idPanne, Short note) {
        if (note < 1 || note > 5) {
            throw new BusinessRuleException("La note de satisfaction doit être comprise entre 1 et 5");
        }
        Panne panne = getPanneOuException(idPanne);
        if (panne.getStatut() != StatutPanne.REPAREE) {
            throw new BusinessRuleException("La panne doit être réparée avant de pouvoir être notée");
        }
        panne.setNoteSatisfaction(note);
        return panneRepository.save(panne);
    }

    // REFORME
    // Délégation à EquipementService.mettreAuRebut() pour garantir
    // la traçabilité unique (RG-04) et éviter la duplication de code.

    @Transactional
    public Panne reformerPanne(Long idPanne, String motif, Long idUtilisateurOperateur) {
        if (motif == null || motif.isBlank()) {
            throw new BusinessRuleException("Le motif de reforme est obligatoire");
        }

        Panne panne = getPanneOuException(idPanne);

        if (panne.getStatut() == StatutPanne.REFORMEE) {
            throw new BusinessRuleException("Cette panne est déjà reformée");
        }

        // Clôture de la panne
        panne.setStatut(StatutPanne.REFORMEE);
        panneRepository.save(panne);

        // Délégation à EquipementService pour la mise au rebut + traçabilité
        Equipement equipement = panne.getEquipement();
        equipementService.mettreAuRebut(
                equipement.getIdEquipement(),
                "Reforme suite panne - " + motif,
                idUtilisateurOperateur);

        return panne;
    }

    // CONSULTATION

    public List<Panne> listerActives() {
        return panneRepository.findPannesActives();
    }

    public List<Panne> listerParEquipement(Long idEquipement) {
        return panneRepository.findByEquipementIdEquipement(idEquipement);
    }

    public List<Panne> listerParStatut(StatutPanne statut) {
        return panneRepository.findByStatut(statut);
    }

    public Long compterCritiquesNonReparees() {
        return panneRepository.countPannesCritiquesNonReparees();
    }

    private Panne getPanneOuException(Long idPanne) {
        return panneRepository.findById(idPanne)
                .orElseThrow(() -> new ResourceNotFoundException("Panne", idPanne));
    }

    public Panne getParId(Long idPanne) {
        return getPanneOuException(idPanne);
    }

    public List<Panne> listerParSignaleur(Long idUtilisateur) {
        return panneRepository.findByUtilisateurSignaleurIdUtilisateur(idUtilisateur);
    }
}