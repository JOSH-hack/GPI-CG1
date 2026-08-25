/*

Nom du fichier   : AgentRepository.java
Objectif         : Interface Spring Data JPA pour la gestion des agents
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {

    List<Agent> findByNomContainingIgnoreCase(String nom);

    Optional<Agent> findByUtilisateurIdUtilisateur(Long idUtilisateur);

    List<Agent> findByFonctionContainingIgnoreCase(String fonction);
}