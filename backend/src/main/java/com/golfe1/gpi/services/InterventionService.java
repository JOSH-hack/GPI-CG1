/*

Nom du fichier   : InterventionService.java
Objectif         : Logique métier des interventions techniques 
                    - création, diagnostic, rédaction du rapport par le technicien,
                      validation DSI (2 étapes séparées),
                      traçabilité automatique (RG-04)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.*;
import com.golfe1.gpi.entities.enums.*;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.exceptions.ResourceNotFoundException;
import com.golfe1.gpi.exceptions.UnauthorizedActionException;
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

    //  CREATION 

    @Transactional
    public Intervention creerIntervention(Long idPanne, Long idTechnicien, TypeIntervention typeIntervention) {
        Panne panne = panneRepository.findById(idPanne)
                .orElseThrow(() -> new ResourceNotFoundException("Panne", idPanne));
        Utilisateur technicien = utilisateurRepository.findById(idTechnicien)
                .orElseThrow(() -> new ResourceNotFoundException("Technicien", idTechnicien));

        Intervention intervention = new Intervention();
        intervention.setPanne(panne);
        intervention.setTechnicien(technicien);
        intervention.setTypeIntervention(typeIntervention);
        intervention.setDateIntervention(LocalDateTime.now());

        panne.setStatut(StatutPanne.EN_COURS_TRAITEMENT);
        panneRepository.save(panne);

        return interventionRepository.save(intervention);
    }

    //  DIAGNOSTIC / SOLUTION 

    @Transactional
    public Intervention enregistrerDiagnostic(Long idIntervention, String diagnostic, String solution,
            String piecesRemplacees) {
        Intervention intervention = getInterventionOuException(idIntervention);
        intervention.setDiagnostic(diagnostic);
        intervention.setSolution(solution);
        intervention.setPiecesRemplacees(piecesRemplacees);
        return interventionRepository.save(intervention);
    }

    //  ETAPE 1 : TECHNICIEN REDIGE LE RAPPORT


    @Transactional
    public Intervention redigerRapport(Long idIntervention, String rapport, Long idTechnicien) {
        Intervention intervention = getInterventionOuException(idIntervention);

        // Vérifier que c'est bien le technicien assigné qui rédige
        if (!intervention.getTechnicien().getIdUtilisateur().equals(idTechnicien)) {
            throw new UnauthorizedActionException("Seul le technicien assigné peut rédiger le rapport");
        }

        if (intervention.getDateResolution() != null) {
            throw new BusinessRuleException("L'intervention est déjà clôturée");
        }

        intervention.setRapport(rapport);
        intervention.setDateRapport(LocalDateTime.now());

        return interventionRepository.save(intervention);
    }

    //  ETAPE 2 : DSI VALIDE 
    // Seul le DSI peut valider. À ce moment seulement, le statut de l'équipement
    // est mis à jour et la panne est clôturée (RG-04).

    @Transactional
    public Intervention validerParDsi(Long idIntervention, Long idValidateurDsi) {
        Intervention intervention = getInterventionOuException(idIntervention);
        Utilisateur validateur = utilisateurRepository.findById(idValidateurDsi)
                .orElseThrow(() -> new ResourceNotFoundException("Validateur DSI", idValidateurDsi));

        // Vérifier le rôle DSI
        if (validateur.getRole() != RoleUtilisateur.RESPONSABLE_DSI ) {
            throw new UnauthorizedActionException("Seul le DSI peut valider une intervention");
        }

        // Vérifier que le rapport a été rédigé
        if (intervention.getRapport() == null || intervention.getRapport().isBlank()) {
            throw new BusinessRuleException("Le rapport doit être rédigé avant validation");
        }

        // Vérifier que ce n'est pas déjà validé
        if (intervention.getDateValidationDsi() != null) {
            throw new BusinessRuleException("Cette intervention est déjà validée");
        }

        Panne panne = intervention.getPanne();
        Equipement equipement = panne.getEquipement();

        StatutEquipement ancienStatut = equipement.getStatut();
        ResultatIntervention resultat = intervention.getResultat();

        // Si l'intervention n'a pas encore de résultat, on considère que c'est une
        // réparation
        if (resultat == null) {
            resultat = ResultatIntervention.REPARATION;
            intervention.setResultat(resultat);
        }

        StatutEquipement nouveauStatut = (resultat == ResultatIntervention.REPARATION)
                ? StatutEquipement.EN_SERVICE
                : ancienStatut;

        // Clôture de l'intervention
        intervention.setValidateurDsi(validateur);
        intervention.setDateValidationDsi(LocalDateTime.now());
        intervention.setDateResolution(LocalDateTime.now());
        interventionRepository.save(intervention);

        // Clôture de la panne
        panne.setStatut(StatutPanne.REPAREE);
        panneRepository.save(panne);

        // Mise à jour du statut de l'équipement (uniquement si changement réel)
        if (nouveauStatut != ancienStatut) {
            equipement.setStatut(nouveauStatut);
            equipementRepository.save(equipement);
        }

        // Traçabilité RG-04
        HistoriqueMouvement mouvement = new HistoriqueMouvement();
        mouvement.setTypeMouvement(TypeMouvement.CHANGEMENT_STATUT);
        mouvement.setMotif("Intervention validée par DSI - " + resultat);
        mouvement.setAncienneValeur(ancienStatut.name());
        mouvement.setNouvelleValeur(nouveauStatut.name());
        mouvement.setEquipement(equipement);
        mouvement.setOperateur(validateur);
        mouvement.setDateMouvement(LocalDateTime.now());
        historiqueMouvementRepository.save(mouvement);

        return intervention;
    }

    @Transactional
    public Intervention enregistrerResultat(Long idIntervention, ResultatIntervention resultat, Long idTechnicien) {
        Intervention intervention = getInterventionOuException(idIntervention);

        if (!intervention.getTechnicien().getIdUtilisateur().equals(idTechnicien)) {
            throw new UnauthorizedActionException("Seul le technicien assigné peut renseigner le résultat");
        }
        if (intervention.getDateResolution() != null) {
            throw new BusinessRuleException("L'intervention est déjà clôturée");
        }

        intervention.setResultat(resultat);
        return interventionRepository.save(intervention);
    }

    //  CONSULTATION 

    public List<Intervention> listerParPanne(Long idPanne) {
        return interventionRepository.findByPanneIdPanne(idPanne);
    }

    public List<Intervention> listerEnAttenteValidationDsi() {
        return interventionRepository.findEnAttenteValidationDsi();
    }

    private Intervention getInterventionOuException(Long idIntervention) {
        return interventionRepository.findById(idIntervention)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention", idIntervention));
    }
}