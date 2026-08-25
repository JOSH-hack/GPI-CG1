/*

Nom du fichier   : EquipementLogicielRepository.java
Objectif         : Interface Spring Data JPA pour le sous-type logiciel
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.EquipementLogiciel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EquipementLogicielRepository extends JpaRepository<EquipementLogiciel, Long> {

    List<EquipementLogiciel> findByVersionContainingIgnoreCase(String version);

    List<EquipementLogiciel> findByDateExpirationLicenceBefore(LocalDate date);
}