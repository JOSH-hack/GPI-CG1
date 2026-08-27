/*

Nom du fichier   : EquipementService.java
Objectif         : Logique métier des équipements - 
                    création des 3 sous-types (Matériel/Logiciel/Réseau),
                    affectation, déplacement, mise au rebut
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.*;
import com.golfe1.gpi.entities.enums.StatutEquipement;
import com.golfe1.gpi.entities.enums.TypeMouvement;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.exceptions.ResourceNotFoundException;
import com.golfe1.gpi.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EquipementService {

    private final EquipementRepository equipementRepository;
    private final EquipementMaterielRepository equipementMaterielRepository;
    private final EquipementLogicielRepository equipementLogicielRepository;
    private final EquipementReseauRepository equipementReseauRepository;
    private final CategorieRepository categorieRepository;
    private final LocalisationRepository localisationRepository;
    private final HistoriqueMouvementRepository historiqueMouvementRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final AgentRepository agentRepository;

    public EquipementService(EquipementRepository equipementRepository,
            EquipementMaterielRepository equipementMaterielRepository,
            EquipementLogicielRepository equipementLogicielRepository,
            EquipementReseauRepository equipementReseauRepository,
            CategorieRepository categorieRepository,
            LocalisationRepository localisationRepository,
            HistoriqueMouvementRepository historiqueMouvementRepository,
            UtilisateurRepository utilisateurRepository , AgentRepository agentRepository) {
        this.equipementRepository = equipementRepository;
        this.equipementMaterielRepository = equipementMaterielRepository;
        this.equipementLogicielRepository = equipementLogicielRepository;
        this.equipementReseauRepository = equipementReseauRepository;
        this.categorieRepository = categorieRepository;
        this.localisationRepository = localisationRepository;
        this.historiqueMouvementRepository = historiqueMouvementRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.agentRepository = agentRepository;
    }

    //  CREATION DES SOUS-TYPES 

    @Transactional
    public EquipementMateriel creerEquipementMateriel(EquipementMateriel equipement, Long idCategorie,
            Long idLocalisation) {
        appliquerCategorieEtLocalisation(equipement, idCategorie, idLocalisation);
        if (equipement.getStatut() == null) {
            equipement.setStatut(StatutEquipement.EN_STOCK);
        }
        return equipementMaterielRepository.save(equipement);
    }

    @Transactional
    public EquipementLogiciel creerEquipementLogiciel(EquipementLogiciel equipement, Long idCategorie,
            Long idLocalisation) {
        appliquerCategorieEtLocalisation(equipement, idCategorie, idLocalisation);
        if (equipement.getStatut() == null) {
            equipement.setStatut(StatutEquipement.EN_STOCK);
        }
        return equipementLogicielRepository.save(equipement);
    }

    @Transactional
    public EquipementReseau creerEquipementReseau(EquipementReseau equipement, Long idCategorie,
            Long idLocalisation) {
        appliquerCategorieEtLocalisation(equipement, idCategorie, idLocalisation);
        if (equipement.getStatut() == null) {
            equipement.setStatut(StatutEquipement.EN_STOCK);
        }
        return equipementReseauRepository.save(equipement);
    }

    private void appliquerCategorieEtLocalisation(Equipement equipement, Long idCategorie, Long idLocalisation) {
        if (equipementRepository.existsByCodeInventaire(equipement.getCodeInventaire())) {
            throw new BusinessRuleException(
                    "Le code inventaire existe deja : " + equipement.getCodeInventaire());
        }
        Categorie categorie = categorieRepository.findById(idCategorie)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", idCategorie));
        Localisation localisation = localisationRepository.findById(idLocalisation)
                .orElseThrow(() -> new ResourceNotFoundException("Localisation", idLocalisation));
        equipement.setCategorie(categorie);
        equipement.setLocalisation(localisation);
    }

    //  AFFECTATION A UN AGENT 
    
    @Transactional
    public Equipement affecterAgent(Long idEquipement, Long idAgent, Long idUtilisateurOperateur) {
        Equipement equipement = getEquipementOuException(idEquipement);
        Utilisateur operateur = getUtilisateurOuException(idUtilisateurOperateur);
        Agent nouvelAgent = agentRepository.findById(idAgent)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", idAgent));

        String ancienneValeur = equipement.getAgent() != null
                ? equipement.getAgent().getNom() + " " + equipement.getAgent().getPrenom()
                : "Non affecte";
        String nouvelleValeur = nouvelAgent.getNom() + " " + nouvelAgent.getPrenom();

        equipement.setAgent(nouvelAgent);
        equipementRepository.save(equipement);

        enregistrerMouvement(equipement, TypeMouvement.AFFECTATION, "Changement d'affectation",
                ancienneValeur, nouvelleValeur, operateur);

        return equipement;
    }

    public List<Equipement> listerTous() {
        return equipementRepository.findAll();
    }

    public Equipement getParId(Long idEquipement) {
        return getEquipementOuException(idEquipement);
    }

    public List<Equipement> listerParAgent(Long idAgent) {
        return equipementRepository.findByAgentIdAgent(idAgent);
    }

    //  DEPLACEMENT 

    @Transactional
    public Equipement deplacer(Long idEquipement, Long idNouvelleLocalisation, String motif,
            Long idUtilisateurOperateur) {
        Equipement equipement = getEquipementOuException(idEquipement);
        Localisation nouvelleLocalisation = localisationRepository.findById(idNouvelleLocalisation)
                .orElseThrow(() -> new ResourceNotFoundException("Localisation", idNouvelleLocalisation));
        Utilisateur operateur = getUtilisateurOuException(idUtilisateurOperateur);

        String ancienneValeur = equipement.getLocalisation().getAnnexe() + " - "
                + equipement.getLocalisation().getService();
        String nouvelleValeur = nouvelleLocalisation.getAnnexe() + " - " + nouvelleLocalisation.getService();

        equipement.setLocalisation(nouvelleLocalisation);
        equipementRepository.save(equipement);

        enregistrerMouvement(equipement, TypeMouvement.DEPLACEMENT, motif, ancienneValeur, nouvelleValeur, operateur);

        return equipement;
    }

    //  MISE AU REBUT 
    // Action directe par le technicien/administrateur, pas besoin de validation
    // DSI.
    // Le motif est obligatoire et tracé dans l'historique des mouvements.
    // L'agent est détaché de l'équipement.

    @Transactional
    public Equipement mettreAuRebut(Long idEquipement, String motif, Long idUtilisateurOperateur) {
        if (motif == null || motif.isBlank()) {
            throw new BusinessRuleException("Le motif de mise au rebut est obligatoire");
        }

        Equipement equipement = getEquipementOuException(idEquipement);
        Utilisateur operateur = getUtilisateurOuException(idUtilisateurOperateur);

        StatutEquipement ancienStatut = equipement.getStatut();

        // Détacher l'agent et changer le statut
        equipement.setAgent(null);
        equipement.setStatut(StatutEquipement.MIS_AU_REBUT);
        equipementRepository.save(equipement);

        enregistrerMouvement(equipement, TypeMouvement.CHANGEMENT_STATUT, "Mise au rebut - " + motif,
                ancienStatut.name(), StatutEquipement.MIS_AU_REBUT.name(), operateur);

        return equipement;
    }

    private void enregistrerMouvement(Equipement equipement, TypeMouvement type, String motif,
            String ancienneValeur, String nouvelleValeur, Utilisateur operateur) {
        HistoriqueMouvement mouvement = new HistoriqueMouvement();
        mouvement.setEquipement(equipement);
        mouvement.setTypeMouvement(type);
        mouvement.setMotif(motif);
        mouvement.setAncienneValeur(ancienneValeur);
        mouvement.setNouvelleValeur(nouvelleValeur);
        mouvement.setOperateur(operateur);
        mouvement.setDateMouvement(LocalDateTime.now());
        historiqueMouvementRepository.save(mouvement);
    }

    //  CONSULTATION 

    public List<Equipement> listerParStatut(StatutEquipement statut) {
        return equipementRepository.findByStatut(statut);
    }

    public List<Equipement> listerParCategorie(Long idCategorie) {
        return equipementRepository.findByCategorieIdCategorie(idCategorie);
    }

    public Equipement getParCodeInventaire(String codeInventaire) {
        return equipementRepository.findByCodeInventaire(codeInventaire)
                .orElseThrow(() -> new ResourceNotFoundException("Equipement", "code inventaire", codeInventaire));
    }

    public Long compterParStatut(StatutEquipement statut) {
        return equipementRepository.countByStatut(statut);
    }

    private Equipement getEquipementOuException(Long idEquipement) {
        return equipementRepository.findById(idEquipement)
                .orElseThrow(() -> new ResourceNotFoundException("Equipement", idEquipement));
    }

    private Utilisateur getUtilisateurOuException(Long idUtilisateur) {
        return utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", idUtilisateur));
    }
}