/*

Nom du fichier   : PieceJointeRepository.java
Objectif         : Interface Spring Data JPA pour la gestion des pièces jointes (auto-destruction)
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.PieceJointe;
import com.golfe1.gpi.entities.enums.TypePieceJointe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PieceJointeRepository extends JpaRepository<PieceJointe, Long> {

    List<PieceJointe> findByPanneIdPanne(Long idPanne);

    List<PieceJointe> findByPanneIdPanneAndSupprimeeFalse(Long idPanne);

    List<PieceJointe> findByTypeFichier(TypePieceJointe typeFichier);

    @Query("SELECT pj FROM PieceJointe pj WHERE pj.supprimee = false AND pj.supprimeeParTechnicien = false AND pj.dateExpiration < :now")
    List<PieceJointe> findExpirees(@Param("now") LocalDateTime now);

    @Query("SELECT pj FROM PieceJointe pj WHERE pj.vuesRestantes <= 0 AND pj.supprimee = false")
    List<PieceJointe> findEpuisees();
}