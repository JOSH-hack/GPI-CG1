/*

Nom du fichier   : MessageRepository.java
Objectif         : Interface Spring Data JPA pour la gestion des messages de chat
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByInterventionIdIntervention(Long idIntervention);

    List<Message> findByExpediteurIdUtilisateur(Long idExpediteur);

    List<Message> findByInterventionIdInterventionOrderByDateEnvoiAsc(Long idIntervention);
}