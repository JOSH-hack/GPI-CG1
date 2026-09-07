/*

Nom du fichier   : LocalisationRepository.java
Objectif         : Interface Spring Data JPA pour la gestion des localisations
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.Localisation;
import com.golfe1.gpi.entities.enums.TypeAnnexe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocalisationRepository extends JpaRepository<Localisation, Long> {

    List<Localisation> findByAnnexe(TypeAnnexe annexe);

    List<Localisation> findByServiceContainingIgnoreCase(String service);
}