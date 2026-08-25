/*

Nom du fichier   : InterventionService.java
Objectif         : Logique métier des interventions techniques 
                    - création, chat, et transaction "Terminer l'intervention"
                     (RG-04 : mise à jour automatique du statut équipement + 
                     création de l'historique de mouvement en une seule transaction)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.*;
import com.golfe1.gpi.entities.enums.*;
import com.golfe1.gpi.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterventionService {

    private final InterventionRepository interventionRepository;
    private final PanneRepository panneRepository;
    private final EquipementRepository equipementRepository;
    private final HistoriqueMouvementRepository historiqueMouvementRepository;
    private final UtilisateurRepository utilisateurRepository;

    public InterventionService(InterventionRepository interventionRepository,
            PanneRepository panneRepository,
            EquipementRepository equipementRepository,
            HistoriqueMouvementRepository historiqueMouvementRepository,
            UtilisateurRepository utilisateurRepository) {
        this.interventionRepository = interventionRepository;
        this.panneRepository = panneRepository;
        this.equipementRepository = equipementRepository;
        this.historiqueMouvementRepository = historiqueMouvementRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    // Creation d'une intervention (le technicien prend en charge une panne)
    @Transactional
    public Intervention creerIntervention(Long idPanne, Long idTechnicien, TypeIntervention typeIntervention) {
        Panne panne = panneRepository.findById(idPanne)
                .orElseThrow(() -> new IllegalArgumentException("Panne introuvable : " + idPanne));
        Utilisateur technicien = utilisateurRepository.findById(idTechnicien)
                .orElseThrow(() -> new IllegalArgumentException("Technicien introuvable : " + idTechnicien));

        Intervention intervention = new Intervention();
        intervention.setPanne(panne);
        intervention.setTechnicien(technicien);
        intervention.setTypeIntervention(typeIntervention);
        intervention.setDateIntervention(LocalDateTime.now());

        panne.setStatut(StatutPanne.EN_COURS_TRAITEMENT);
        panneRepository.save(panne);

        return interventionRepository.save(intervention);
    }

    // Enregistrement du diagnostic / solution en cours d'intervention
    @Transactional
    public Intervention enregistrerDiagnostic(Long idIntervention, String diagnostic, String solution,
            String piecesRemplacees) {
        Intervention intervention = getInterventionOuException(idIntervention);
        intervention.setDiagnostic(diagnostic);
        intervention.setSolution(solution);
        intervention.setPiecesRemplacees(piecesRemplacees);
        return interventionRepository.save(intervention);
    }

    // RG-04 : Terminer l'intervention 
    // Une seule transaction : cloture l'intervention + met a jour le statut de
    // l'equipement + trace le changement dans l'historique des mouvements.
    // Aucune action manuelle separee n'est necessaire pour le statut equipement.
    @Transactional
    public Intervention terminerIntervention(Long idIntervention, ResultatIntervention resultat,
            Long idUtilisateurOperateur) {

        Intervention intervention = getInterventionOuException(idIntervention);
        Panne panne = intervention.getPanne();
        Equipement equipement = panne.getEquipement();
        Utilisateur operateur = utilisateurRepository.findById(idUtilisateurOperateur)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable : " + idUtilisateurOperateur));

        StatutEquipement ancienStatut = equipement.getStatut();
        StatutEquipement nouveauStatut = (resultat == ResultatIntervention.REPARATION)
                ? StatutEquipement.EN_SERVICE
                : ancienStatut; // DEPANNAGE : suivi necessaire, on ne remet pas EN_SERVICE automatiquement

        //Cloture de l'intervention
        intervention.setResultat(resultat);
        intervention.setDateResolution(LocalDateTime.now());
        interventionRepository.save(intervention);

        //Cloture de la panne associee
        panne.setStatut(StatutPanne.REPAREE);
        panneRepository.save(panne);

        //Mise a jour du statut de l'equipement (uniquement si changement reel)
        if (nouveauStatut != ancienStatut) {
            equipement.setStatut(nouveauStatut);
            equipementRepository.save(equipement);
        }

        //Tracabilite : creation de la ligne HistoriqueMouvement (RG-04)
        HistoriqueMouvement mouvement = new HistoriqueMouvement();
        mouvement.setTypeMouvement(TypeMouvement.CHANGEMENT_STATUT);
        mouvement.setMotif("Intervention terminee - " + resultat);
        mouvement.setAncienneValeur(ancienStatut.name());
        mouvement.setNouvelleValeur(nouveauStatut.name());
        mouvement.setEquipement(equipement);
        mouvement.setOperateur(operateur);
        mouvement.setDateMouvement(LocalDateTime.now());
        historiqueMouvementRepository.save(mouvement);

        return intervention;
    }

    // Consultation des interventions 
    public List<Intervention> listerParPanne(Long idPanne) {
        return interventionRepository.findByPanneIdPanne(idPanne);
    }

    public List<Intervention> listerEnAttenteValidationDsi() {
        return interventionRepository.findEnAttenteValidationDsi();
    }

    private Intervention getInterventionOuException(Long idIntervention) {
        return interventionRepository.findById(idIntervention)
                .orElseThrow(() -> new IllegalArgumentException("Intervention introuvable : " + idIntervention));
    }
}