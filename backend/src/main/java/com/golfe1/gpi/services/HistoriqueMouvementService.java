/*

Nom du fichier   : HistoriqueMouvementService.java
Objectif         : Consultation de l'historique des mouvements d'équipements -
                    alimente la page Suivi (timeline par équipement) et la page 
                    Mouvements (liste globale). La création des mouvements se 
                    fait via EquipementService (deplacer/affecterAgent) ou 
                    InterventionService (RG-04), jamais directement ici, pour 
                    garantir la cohérence entre l'état de l'équipement et son historique.
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.HistoriqueMouvement;
import com.golfe1.gpi.entities.enums.TypeMouvement;
import com.golfe1.gpi.repositories.HistoriqueMouvementRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HistoriqueMouvementService {

    private final HistoriqueMouvementRepository historiqueMouvementRepository;

    public HistoriqueMouvementService(HistoriqueMouvementRepository historiqueMouvementRepository) {
        this.historiqueMouvementRepository = historiqueMouvementRepository;
    }

    //  Page Suivi : timeline chronologique d'un equipement (plus recent en premier) 
    public List<HistoriqueMouvement> timelineParEquipement(Long idEquipement) {
        return historiqueMouvementRepository.findByEquipementIdEquipementOrderByDateMouvementDesc(idEquipement);
    }

    //  Page Mouvements : liste globale, filtrable par type 
    public List<HistoriqueMouvement> listerParType(TypeMouvement type) {
        return historiqueMouvementRepository.findByTypeMouvement(type);
    }

    public List<HistoriqueMouvement> listerParEquipement(Long idEquipement) {
        return historiqueMouvementRepository.findByEquipementIdEquipement(idEquipement);
    }

    public List<HistoriqueMouvement> listerParOperateur(Long idOperateur) {
        return historiqueMouvementRepository.findByOperateurIdUtilisateur(idOperateur);
    }

    public List<HistoriqueMouvement> listerParPeriode(LocalDateTime debut, LocalDateTime fin) {
        return historiqueMouvementRepository.findByDateMouvementBetween(debut, fin);
    }

    // Tout lister (pagination geree cote controleur si besoin) 
    public List<HistoriqueMouvement> listerTout() {
        return historiqueMouvementRepository.findAll();
    }
}