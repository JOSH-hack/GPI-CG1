/*

Nom du fichier   : CategorieRepository.java
Objectif         : Interface Spring Data JPA pour la gestion des catégories d'équipements
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.Categorie;
import com.golfe1.gpi.entities.enums.TypeCategorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategorieRepository extends JpaRepository<Categorie, Long> {

    Optional<Categorie> findByLibelle(String libelle);

    boolean existsByLibelle(String libelle);

    List<Categorie> findByType(TypeCategorie type);
}