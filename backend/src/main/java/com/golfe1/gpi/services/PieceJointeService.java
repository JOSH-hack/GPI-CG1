/*

Nom du fichier   : PieceJointeService.java
Objectif         : Logique métier des pièces jointes de panne - 
                    upload avec expiration automatique (4h ou 3 vues), 
                    consultation avec décompte des vues, suppression manuelle par le technicien,
                    suppression physique du fichier sur le disque
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Panne;
import com.golfe1.gpi.entities.PieceJointe;
import com.golfe1.gpi.entities.enums.TypePieceJointe;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.exceptions.ResourceNotFoundException;
import com.golfe1.gpi.repositories.PanneRepository;
import com.golfe1.gpi.repositories.PieceJointeRepository;
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

    public PieceJointeService(PieceJointeRepository pieceJointeRepository, PanneRepository panneRepository) {
        this.pieceJointeRepository = pieceJointeRepository;
        this.panneRepository = panneRepository;
    }

    //  UPLOAD 

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

    //  CONSULTATION 

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
        }

        return pieceJointeRepository.save(pieceJointe);
    }

    //  SUPPRESSION MANUELLE PAR LE TECHNICIEN
    // 

    @Transactional
    public PieceJointe supprimerParTechnicien(Long idPieceJointe) {
        PieceJointe pieceJointe = pieceJointeRepository.findById(idPieceJointe)
                .orElseThrow(() -> new ResourceNotFoundException("Piece jointe", idPieceJointe));

        supprimerFichierPhysique(pieceJointe.getCheminFichier());

        pieceJointe.setSupprimeeParTechnicien(true);
        pieceJointe.setSupprimee(true);
        pieceJointe.setDateSuppression(LocalDateTime.now());

        return pieceJointeRepository.save(pieceJointe);
    }

    //  PURGE AUTOMATIQUE 

    @Transactional
    public int purgerExpirees() {
        List<PieceJointe> expirees = pieceJointeRepository.findExpirees(LocalDateTime.now());
        for (PieceJointe pieceJointe : expirees) {
            supprimerFichierPhysique(pieceJointe.getCheminFichier());
            pieceJointe.setSupprimee(true);
            pieceJointe.setDateSuppression(LocalDateTime.now());
        }
        pieceJointeRepository.saveAll(expirees);
        return expirees.size();
    }

    //  CONSULTATION 

    public List<PieceJointe> listerParPanne(Long idPanne) {
        return pieceJointeRepository.findByPanneIdPanneAndSupprimeeFalse(idPanne);
    }

    //  SUPPRESSION PHYSIQUE DU FICHIER 

    private void supprimerFichierPhysique(String cheminFichier) {
        if (cheminFichier == null || cheminFichier.isBlank())
            return;
        try {
            Path path = Paths.get(cheminFichier);
            Files.deleteIfExists(path);
        } catch (Exception e) {
            // Log l'erreur mais ne bloque pas la transaction
            System.err.println("Impossible de supprimer le fichier : " + cheminFichier + " - " + e.getMessage());
        }
    }
}