/*

Nom du fichier   : EquipementReseauRepository.java
Objectif         : Interface Spring Data JPA pour le sous-type réseau
Propriétaire     : Josué BEDEL
Date de création : 24/08/2026

*/

package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.EquipementReseau;
import com.golfe1.gpi.entities.enums.TypeAdresseReseau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipementReseauRepository extends JpaRepository<EquipementReseau, Long> {

    Optional<EquipementReseau> findByAdresseIp(String adresseIp);

    List<EquipementReseau> findByTypeAdresse(TypeAdresseReseau typeAdresse);

    List<EquipementReseau> findByNomHoteContainingIgnoreCase(String nomHote);
}