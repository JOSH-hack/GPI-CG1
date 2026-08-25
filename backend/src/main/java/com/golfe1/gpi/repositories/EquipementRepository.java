/*

Nom du fichier   : EquipementRepository.java
Objectif         : Interface Spring Data JPA pour la gestion des équipements
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.Equipement;
import com.golfe1.gpi.entities.enums.StatutEquipement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipementRepository extends JpaRepository<Equipement, Long> {

    Optional<Equipement> findByCodeInventaire(String codeInventaire);

    boolean existsByCodeInventaire(String codeInventaire);

    List<Equipement> findByStatut(StatutEquipement statut);

    List<Equipement> findByCategorieIdCategorie(Long idCategorie);

    List<Equipement> findByLocalisationIdLocalisation(Long idLocalisation);

    List<Equipement> findByAgentIdAgent(Long idAgent);

    List<Equipement> findByNomContainingIgnoreCase(String nom);

    @Query("SELECT e FROM Equipement e WHERE e.statut = :statut AND e.categorie.idCategorie = :idCategorie")
    List<Equipement> findByStatutAndCategorie(@Param("statut") StatutEquipement statut,
            @Param("idCategorie") Long idCategorie);

    @Query("SELECT COUNT(e) FROM Equipement e WHERE e.statut = :statut")
    Long countByStatut(@Param("statut") StatutEquipement statut);
}