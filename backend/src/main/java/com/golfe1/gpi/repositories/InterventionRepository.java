/*

Nom du fichier   : InterventionRepository.java
Objectif         : Interface Spring Data JPA pour la gestion des interventions techniques
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.Intervention;
import com.golfe1.gpi.entities.enums.ResultatIntervention;
import com.golfe1.gpi.entities.enums.TypeIntervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, Long> {

    List<Intervention> findByPanneIdPanne(Long idPanne);

    List<Intervention> findByTechnicienIdUtilisateur(Long idTechnicien);

    List<Intervention> findByTypeIntervention(TypeIntervention typeIntervention);

    List<Intervention> findByResultat(ResultatIntervention resultat);

    List<Intervention> findByValidateurDsiIdUtilisateur(Long idValidateur);

    List<Intervention> findByDateInterventionBetween(LocalDateTime debut, LocalDateTime fin);

    @Query("SELECT i FROM Intervention i WHERE i.dateValidationDsi IS NULL")
    List<Intervention> findEnAttenteValidationDsi();

    @Query("SELECT COUNT(i) FROM Intervention i WHERE i.technicien.idUtilisateur = :idTechnicien")
    Long countByTechnicien(@Param("idTechnicien") Long idTechnicien);
}