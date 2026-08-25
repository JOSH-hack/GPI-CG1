/*

Nom du fichier   : PieceJointeService.java
Objectif         : Logique métier des pièces jointes de panne - 
                    upload avec expiration automatique (4h ou 3 vues), 
                    consultation avec décompte des vues, suppression manuelle par le technicien
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Panne;
import com.golfe1.gpi.entities.PieceJointe;
import com.golfe1.gpi.entities.enums.TypePieceJointe;
import com.golfe1.gpi.repositories.PanneRepository;
import com.golfe1.gpi.repositories.PieceJointeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // œ Upload : jointe a une panne, expiration fixee a 4h et 3 vues 
    @Transactional
    public PieceJointe ajouterPieceJointe(Long idPanne, String cheminFichier, TypePieceJointe typeFichier) {
        Panne panne = panneRepository.findById(idPanne)
                .orElseThrow(() -> new IllegalArgumentException("Panne introuvable : " + idPanne));

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

    // œ Consultation : decompte une vue, marque comme supprimee si epuisee --
    @Transactional
    public PieceJointe consulter(Long idPieceJointe) {
        PieceJointe pieceJointe = pieceJointeRepository.findById(idPieceJointe)
                .orElseThrow(() -> new IllegalArgumentException("Piece jointe introuvable : " + idPieceJointe));

        if (!pieceJointe.estAccessible()) {
            throw new IllegalStateException("Cette piece jointe n'est plus accessible");
        }

        pieceJointe.setVuesActuelles(pieceJointe.getVuesActuelles() + 1);
        pieceJointe.setVuesRestantes(pieceJointe.getVuesRestantes() - 1);

        if (pieceJointe.getVuesRestantes() <= 0) {
            pieceJointe.setSupprimee(true);
            pieceJointe.setDateSuppression(LocalDateTime.now());
        }

        return pieceJointeRepository.save(pieceJointe);
    }

    // œ Suppression manuelle par le technicien œ-
    @Transactional
    public PieceJointe supprimerParTechnicien(Long idPieceJointe) {
        PieceJointe pieceJointe = pieceJointeRepository.findById(idPieceJointe)
                .orElseThrow(() -> new IllegalArgumentException("Piece jointe introuvable : " + idPieceJointe));

        pieceJointe.setSupprimeeParTechnicien(true);
        pieceJointe.setSupprimee(true);
        pieceJointe.setDateSuppression(LocalDateTime.now());

        return pieceJointeRepository.save(pieceJointe);
    }

    // œ Purge automatique des pieces jointes expirees (a appeler via une --
    // tache planifiee @Scheduled, a ecrire dans une classe de configuration) --
    @Transactional
    public int purgerExpirees() {
        List<PieceJointe> expirees = pieceJointeRepository.findExpirees(LocalDateTime.now());
        for (PieceJointe pieceJointe : expirees) {
            pieceJointe.setSupprimee(true);
            pieceJointe.setDateSuppression(LocalDateTime.now());
        }
        pieceJointeRepository.saveAll(expirees);
        return expirees.size();
    }

    // œ Consultation œ
    public List<PieceJointe> listerParPanne(Long idPanne) {
        return pieceJointeRepository.findByPanneIdPanneAndSupprimeeFalse(idPanne);
    }
}