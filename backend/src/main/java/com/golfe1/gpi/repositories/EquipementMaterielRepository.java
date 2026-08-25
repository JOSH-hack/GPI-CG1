/*

Nom du fichier   : EquipementMaterielRepository.java
Objectif         : Interface Spring Data JPA pour le sous-type matériel
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.EquipementMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipementMaterielRepository extends JpaRepository<EquipementMateriel, Long> {

    List<EquipementMateriel> findBySystemeExploitationContainingIgnoreCase(String os);

    List<EquipementMateriel> findByAdresseIp(String adresseIp);
}