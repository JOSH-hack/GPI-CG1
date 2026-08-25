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

    public EquipementService(EquipementRepository equipementRepository,
            EquipementMaterielRepository equipementMaterielRepository,
            EquipementLogicielRepository equipementLogicielRepository,
            EquipementReseauRepository equipementReseauRepository,
            CategorieRepository categorieRepository,
            LocalisationRepository localisationRepository,
            HistoriqueMouvementRepository historiqueMouvementRepository,
            UtilisateurRepository utilisateurRepository) {
        this.equipementRepository = equipementRepository;
        this.equipementMaterielRepository = equipementMaterielRepository;
        this.equipementLogicielRepository = equipementLogicielRepository;
        this.equipementReseauRepository = equipementReseauRepository;
        this.categorieRepository = categorieRepository;
        this.localisationRepository = localisationRepository;
        this.historiqueMouvementRepository = historiqueMouvementRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    // Creation des sous-types

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
            throw new IllegalArgumentException(
                    "Le code inventaire existe deja : " + equipement.getCodeInventaire());
        }
        Categorie categorie = categorieRepository.findById(idCategorie)
                .orElseThrow(() -> new IllegalArgumentException("Categorie introuvable : " + idCategorie));
        Localisation localisation = localisationRepository.findById(idLocalisation)
                .orElseThrow(() -> new IllegalArgumentException("Localisation introuvable : " + idLocalisation));
        equipement.setCategorie(categorie);
        equipement.setLocalisation(localisation);
    }

    // Affectation a un agent (avec tracabilite du mouvement)
    @Transactional
    public Equipement affecterAgent(Long idEquipement, Agent nouvelAgent, Long idUtilisateurOperateur) {
        Equipement equipement = getEquipementOuException(idEquipement);
        Utilisateur operateur = getUtilisateurOuException(idUtilisateurOperateur);

        String ancienneValeur = equipement.getAgent() != null
                ? equipement.getAgent().getNom() + " " + equipement.getAgent().getPrenom()
                : "Non affecte";
        String nouvelleValeur = nouvelAgent != null
                ? nouvelAgent.getNom() + " " + nouvelAgent.getPrenom()
                : "Non affecte";

        equipement.setAgent(nouvelAgent);
        equipementRepository.save(equipement);

        enregistrerMouvement(equipement, TypeMouvement.AFFECTATION, "Changement d'affectation",
                ancienneValeur, nouvelleValeur, operateur);

        return equipement;
    }

    // Deplacement (avec tracabilite du mouvement)
    @Transactional
    public Equipement deplacer(Long idEquipement, Long idNouvelleLocalisation, String motif,
            Long idUtilisateurOperateur) {
        Equipement equipement = getEquipementOuException(idEquipement);
        Localisation nouvelleLocalisation = localisationRepository.findById(idNouvelleLocalisation)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Localisation introuvable : " + idNouvelleLocalisation));
        Utilisateur operateur = getUtilisateurOuException(idUtilisateurOperateur);

        String ancienneValeur = equipement.getLocalisation().getAnnexe() + " - "
                + equipement.getLocalisation().getService();
        String nouvelleValeur = nouvelleLocalisation.getAnnexe() + " - " + nouvelleLocalisation.getService();

        equipement.setLocalisation(nouvelleLocalisation);
        equipementRepository.save(equipement);

        enregistrerMouvement(equipement, TypeMouvement.DEPLACEMENT, motif, ancienneValeur, nouvelleValeur, operateur);

        return equipement;
    }

    // Mise au rebut
    // Action directe par le technicien/administrateur pas besoin de validation DSI.
    // Le motif est obligatoire et trace dans l'historique des mouvements.
    @Transactional
    public Equipement mettreAuRebut(Long idEquipement, String motif, Long idUtilisateurOperateur) {
        if (motif == null || motif.isBlank()) {
            throw new IllegalArgumentException("Le motif de mise au rebut est obligatoire");
        }

        Equipement equipement = getEquipementOuException(idEquipement);
        Utilisateur operateur = getUtilisateurOuException(idUtilisateurOperateur);

        StatutEquipement ancienStatut = equipement.getStatut();
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

    // Consultation 
    public List<Equipement> listerParStatut(StatutEquipement statut) {
        return equipementRepository.findByStatut(statut);
    }

    public List<Equipement> listerParCategorie(Long idCategorie) {
        return equipementRepository.findByCategorieIdCategorie(idCategorie);
    }

    public Equipement getParCodeInventaire(String codeInventaire) {
        return equipementRepository.findByCodeInventaire(codeInventaire)
                .orElseThrow(() -> new IllegalArgumentException("Equipement introuvable : " + codeInventaire));
    }

    public Long compterParStatut(StatutEquipement statut) {
        return equipementRepository.countByStatut(statut);
    }

    private Equipement getEquipementOuException(Long idEquipement) {
        return equipementRepository.findById(idEquipement)
                .orElseThrow(() -> new IllegalArgumentException("Equipement introuvable : " + idEquipement));
    }

    private Utilisateur getUtilisateurOuException(Long idUtilisateur) {
        return utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable : " + idUtilisateur));
    }
}