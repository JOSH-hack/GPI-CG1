/*

Nom du fichier   : UtilisateurRepository.java
Objectif         : Interface Spring Data JPA pour la gestion des utilisateurs
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.entities.enums.RoleUtilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Utilisateur> findByRole(RoleUtilisateur role);

    List<Utilisateur> findByActifTrue();

    List<Utilisateur> findByActifFalse();
}