/*

Nom du fichier   : HistoriqueMouvementRepository.java
Objectif         : Interface Spring Data JPA pour le suivi des mouvements d'équipements
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.HistoriqueMouvement;
import com.golfe1.gpi.entities.enums.TypeMouvement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HistoriqueMouvementRepository extends JpaRepository<HistoriqueMouvement, Long> {

    List<HistoriqueMouvement> findByEquipementIdEquipement(Long idEquipement);

    List<HistoriqueMouvement> findByOperateurIdUtilisateur(Long idOperateur);

    List<HistoriqueMouvement> findByTypeMouvement(TypeMouvement typeMouvement);

    List<HistoriqueMouvement> findByEquipementIdEquipementOrderByDateMouvementDesc(Long idEquipement);

    List<HistoriqueMouvement> findByDateMouvementBetween(LocalDateTime debut, LocalDateTime fin);
}