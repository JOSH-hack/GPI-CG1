/*

Nom du fichier   : PieceJointeService.java
Objectif         : Logique métier des pièces jointes de panne - 
                    upload avec expiration automatique (4h ou 3 vues), 
                    consultation avec décompte des vues, suppression manuelle par le technicien,
                    suppression physique du fichier sur le disque
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026
Date de mise à jour : 27/08/2026
Objet de mise à jour : supprimerParTechnicien() vérifie que l'opérateur est autorisé (TECHNICIEN
                       doit être intervenu sur la panne liée, ADMIN_INFO/ADMIN_SYSTEME sans restriction) ;
                       la suppression (manuelle, par expiration de vues, ou par purge automatique)
                       supprime désormais la ligne en base (hard delete) en plus du fichier physique,
                       au lieu d'un simple marquage "supprimee = true"

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Panne;
import com.golfe1.gpi.entities.PieceJointe;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.entities.enums.RoleUtilisateur;
import com.golfe1.gpi.entities.enums.TypePieceJointe;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.exceptions.ResourceNotFoundException;
import com.golfe1.gpi.exceptions.UnauthorizedActionException;
import com.golfe1.gpi.repositories.InterventionRepository;
import com.golfe1.gpi.repositories.PanneRepository;
import com.golfe1.gpi.repositories.PieceJointeRepository;
import com.golfe1.gpi.repositories.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PieceJointeService {

    private static final long DUREE_EXPIRATION_HEURES = 4;
    private static final int VUES_MAX = 3;

    private final PieceJointeRepository pieceJointeRepository;
    private final PanneRepository panneRepository;
    private final InterventionRepository interventionRepository;
    private final UtilisateurRepository utilisateurRepository;

    public PieceJointeService(PieceJointeRepository pieceJointeRepository,
            PanneRepository panneRepository,
            InterventionRepository interventionRepository,
            UtilisateurRepository utilisateurRepository) {
        this.pieceJointeRepository = pieceJointeRepository;
        this.panneRepository = panneRepository;
        this.interventionRepository = interventionRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    // UPLOAD

    @Transactional
    public PieceJointe ajouterPieceJointe(Long idPanne, String cheminFichier, TypePieceJointe typeFichier) {
        Panne panne = panneRepository.findById(idPanne)
                .orElseThrow(() -> new ResourceNotFoundException("Panne", idPanne));

        PieceJointe pieceJointe = new PieceJointe();
        pieceJointe.setPanne(panne);
        pieceJointe.setCheminFichier(cheminFichier);
        pieceJointe.setTypeFichier(typeFichier);
        pieceJointe.setVuesRestantes(VUES_MAX);
        pieceJointe.setVuesActuelles(0);
        pieceJointe.setSupprimee(false);
        pieceJointe.setSupprimeeParTechnicien(false);
        pieceJointe.setDateUpload(LocalDateTime.now());
        pieceJointe.setDateExpiration(LocalDateTime.now().plusHours(DUREE_EXPIRATION_HEURES));

        return pieceJointeRepository.save(pieceJointe);
    }

    // CONSULTATION
    // À la dernière vue autorisée, la pièce jointe est supprimée du disque ET de la
    // base.

    @Transactional
    public PieceJointe consulter(Long idPieceJointe) {
        PieceJointe pieceJointe = pieceJointeRepository.findById(idPieceJointe)
                .orElseThrow(() -> new ResourceNotFoundException("Piece jointe", idPieceJointe));

        if (!pieceJointe.estAccessible()) {
            throw new BusinessRuleException("Cette pièce jointe n'est plus accessible");
        }

        pieceJointe.setVuesActuelles(pieceJointe.getVuesActuelles() + 1);
        pieceJointe.setVuesRestantes(pieceJointe.getVuesRestantes() - 1);

        if (pieceJointe.getVuesRestantes() <= 0) {
            supprimerFichierPhysique(pieceJointe.getCheminFichier());
            pieceJointe.setSupprimee(true);
            pieceJointe.setDateSuppression(LocalDateTime.now());
            pieceJointeRepository.delete(pieceJointe);
            return pieceJointe; // objet encore utilisable en mémoire pour cette requête (streaming)
        }

        return pieceJointeRepository.save(pieceJointe);
    }

    // SUPPRESSION MANUELLE PAR LE TECHNICIEN
    // Un ADMIN_INFO/ADMIN_SYSTEME peut tout supprimer.
    // Un TECHNICIEN ne peut supprimer que s'il est intervenu sur la panne liée.
    // Supprime le fichier physique ET la ligne en base.

    @Transactional
    public PieceJointe supprimerParTechnicien(Long idPieceJointe, Long idOperateur) {
        PieceJointe pieceJointe = pieceJointeRepository.findById(idPieceJointe)
                .orElseThrow(() -> new ResourceNotFoundException("Piece jointe", idPieceJointe));

        Utilisateur operateur = utilisateurRepository.findById(idOperateur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", idOperateur));

        if (operateur.getRole() == RoleUtilisateur.TECHNICIEN) {
            Long idPanne = pieceJointe.getPanne().getIdPanne();
            boolean estIntervenant = interventionRepository.findByPanneIdPanne(idPanne).stream()
                    .anyMatch(intervention -> intervention.getTechnicien().getIdUtilisateur().equals(idOperateur));

            if (!estIntervenant) {
                throw new UnauthorizedActionException(
                        "Vous ne pouvez supprimer que les pièces jointes des pannes sur lesquelles vous êtes intervenu");
            }
        }

        supprimerFichierPhysique(pieceJointe.getCheminFichier());

        pieceJointe.setSupprimeeParTechnicien(true);
        pieceJointe.setSupprimee(true);
        pieceJointe.setDateSuppression(LocalDateTime.now());

        pieceJointeRepository.delete(pieceJointe);
        return pieceJointe; // renvoyé pour construire la réponse (confirmation), l'objet n'est plus en base
    }

    // PURGE AUTOMATIQUE
    // Supprime les fichiers physiques ET les lignes en base des pièces jointes
    // expirées.

    @Transactional
    public int purgerExpirees() {
        List<PieceJointe> expirees = pieceJointeRepository.findExpirees(LocalDateTime.now());
        for (PieceJointe pieceJointe : expirees) {
            supprimerFichierPhysique(pieceJointe.getCheminFichier());
        }
        pieceJointeRepository.deleteAll(expirees);
        return expirees.size();
    }

    // CONSULTATION

    public List<PieceJointe> listerParPanne(Long idPanne) {
        return pieceJointeRepository.findByPanneIdPanneAndSupprimeeFalse(idPanne);
    }

    // SUPPRESSION PHYSIQUE DU FICHIER

    private void supprimerFichierPhysique(String cheminFichier) {
        if (cheminFichier == null || cheminFichier.isBlank())
            return;
        try {
            Path path = Paths.get(cheminFichier);
            Files.deleteIfExists(path);
        } catch (Exception e) {
            System.err.println("Impossible de supprimer le fichier : " + cheminFichier + " - " + e.getMessage());
        }
    }
}