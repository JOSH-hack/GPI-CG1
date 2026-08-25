/*

Nom du fichier   : PanneService.java
Objectif         : Logique métier des pannes - signalement, consultation, notation de satisfaction par l'agent
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Equipement;
import com.golfe1.gpi.entities.Panne;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.entities.enums.PrioritePanne;
import com.golfe1.gpi.entities.enums.StatutEquipement;
import com.golfe1.gpi.entities.enums.StatutPanne;
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

    public PanneService(PanneRepository panneRepository,
            EquipementRepository equipementRepository,
            UtilisateurRepository utilisateurRepository) {
        this.panneRepository = panneRepository;
        this.equipementRepository = equipementRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    //  Signalement de panne 
    // idSignaleur provient TOUJOURS du JWT cote controleur (SecurityContext),
    // jamais d'un champ du formulaire permet d'éviter toute usurpation d'identite
    @Transactional
    public Panne signalerPanne(Long idEquipement, Long idSignaleur, String description, PrioritePanne priorite) {
        Equipement equipement = equipementRepository.findById(idEquipement)
                .orElseThrow(() -> new IllegalArgumentException("Equipement introuvable : " + idEquipement));
        Utilisateur signaleur = utilisateurRepository.findById(idSignaleur)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable : " + idSignaleur));

        Panne panne = new Panne();
        panne.setEquipement(equipement);
        panne.setUtilisateurSignaleur(signaleur);
        panne.setDescription(description);
        panne.setPriorite(priorite);
        panne.setStatut(StatutPanne.SIGNALEE);
        panne.setDateSurvenance(LocalDateTime.now());

        return panneRepository.save(panne);
    }

    // Notation de satisfaction (par l'agent, une fois la panne reparee)
    @Transactional
    public Panne noterSatisfaction(Long idPanne, Short note) {
        if (note < 1 || note > 5) {
            throw new IllegalArgumentException("La note de satisfaction doit etre comprise entre 1 et 5");
        }
        Panne panne = getPanneOuException(idPanne);
        if (panne.getStatut() != StatutPanne.REPAREE) {
            throw new IllegalStateException("La panne doit etre reparee avant de pouvoir etre notee");
        }
        panne.setNoteSatisfaction(note);
        return panneRepository.save(panne);
    }

    // Reforme (panne jugee irreparable donc on mes l'equipement au rebus)
@Transactional
public Panne reformerPanne(Long idPanne, Long idUtilisateurOperateur) {
    Panne panne = getPanneOuException(idPanne);
    panne.setStatut(StatutPanne.REFORMEE);
    
    // L'équipement est jugé irréparable du coup il sera mis au rebut
    Equipement eq = panne.getEquipement();
    eq.setStatut(StatutEquipement.MIS_AU_REBUT);
    eq.setAgent(null);
    equipementRepository.save(eq);
    
    return panneRepository.save(panne);
}
    // Consultation
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
                .orElseThrow(() -> new IllegalArgumentException("Panne introuvable : " + idPanne));
    }
}