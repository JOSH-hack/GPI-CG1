/*

Nom du fichier   : PanneRepository.java
Objectif         : Interface Spring Data JPA pour la gestion des pannes et tickets
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.Panne;
import com.golfe1.gpi.entities.enums.PrioritePanne;
import com.golfe1.gpi.entities.enums.StatutPanne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PanneRepository extends JpaRepository<Panne, Long> {

    List<Panne> findByStatut(StatutPanne statut);

    List<Panne> findByPriorite(PrioritePanne priorite);

    List<Panne> findByEquipementIdEquipement(Long idEquipement);

    List<Panne> findByUtilisateurSignaleurIdUtilisateur(Long idUtilisateur);

    List<Panne> findByStatutAndPriorite(StatutPanne statut, PrioritePanne priorite);

    @Query("SELECT p FROM Panne p WHERE p.statut = 'SIGNALEE' OR p.statut = 'EN_COURS_TRAITEMENT'")
    List<Panne> findPannesActives();

    @Query("SELECT COUNT(p) FROM Panne p WHERE p.statut = :statut")
    Long countByStatut(@Param("statut") StatutPanne statut);

    @Query("SELECT COUNT(p) FROM Panne p WHERE p.priorite = 'CRITIQUE' AND p.statut <> 'REPAREE'")
    Long countPannesCritiquesNonReparees();
}