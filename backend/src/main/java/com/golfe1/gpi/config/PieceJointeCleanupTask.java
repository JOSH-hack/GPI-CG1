/*

Nom du fichier   : PieceJointeCleanupTask.java
Objectif         : Tâche planifiée qui purge automatiquement les pièces jointes expirées (délai dépassé ou vues épuisées) via PieceJointeService.purgerExpirees()
Propriétaire     : Josué BEDEL
Date de création : 26/08/2026

*/

package com.golfe1.gpi.config;

import com.golfe1.gpi.services.PieceJointeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PieceJointeCleanupTask {

    private static final Logger log = LoggerFactory.getLogger(PieceJointeCleanupTask.class);

    private final PieceJointeService pieceJointeService;

    public PieceJointeCleanupTask(PieceJointeService pieceJointeService) {
        this.pieceJointeService = pieceJointeService;
    }

    // Toutes les 15 minutes : purge les pieces jointes dont la date d'expiration
    // (4h apres upload) est depassee. La purge par epuisement des vues est deja
    // geree immediatement dans PieceJointeService.consulter(), cette tache
    // couvre le cas ou personne n'a jamais consulte la piece jointe.
    @Scheduled(fixedRate = 15 * 60 * 1000)
    public void purgerPiecesJointesExpirees() {
        int nombreSupprimees = pieceJointeService.purgerExpirees();
        if (nombreSupprimees > 0) {
            log.info("Purge automatique : {} piece(s) jointe(s) expiree(s) supprimee(s)", nombreSupprimees);
        }
    }
}