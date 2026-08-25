/*

Nom du fichier   : LocalisationRepository.java
Objectif         : Interface Spring Data JPA pour la gestion des localisations
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.Localisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocalisationRepository extends JpaRepository<Localisation, Long> {

    List<Localisation> findByAnnexeContainingIgnoreCase(String annexe);

    List<Localisation> findByServiceContainingIgnoreCase(String service);

    List<Localisation> findByAnnexeAndService(String annexe, String service);
}