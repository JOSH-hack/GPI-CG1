/*

Nom du fichier   : EquipementMapper.java
Objectif         : Mapper MapStruct pour Equipement et ses sous-types
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.mapper;

import com.golfe1.gpi.dto.request.*;
import com.golfe1.gpi.dto.response.*;
import com.golfe1.gpi.entities.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { CategorieMapper.class, LocalisationMapper.class, AgentMapper.class })
public interface EquipementMapper {

    EquipementResponse toResponse(Equipement equipement);

    EquipementMaterielResponse toResponse(EquipementMateriel equipement);

    EquipementLogicielResponse toResponse(EquipementLogiciel equipement);

    EquipementReseauResponse toResponse(EquipementReseau equipement);

    @Mapping(target = "idEquipement", ignore = true)
    @Mapping(target = "categorie", ignore = true)
    @Mapping(target = "localisation", ignore = true)
    @Mapping(target = "agent", ignore = true)
    Equipement toEntity(EquipementRequest request);

    @Mapping(target = "idEquipement", ignore = true)
    @Mapping(target = "categorie", ignore = true)
    @Mapping(target = "localisation", ignore = true)
    @Mapping(target = "agent", ignore = true)
    EquipementMateriel toEntity(EquipementMaterielRequest request);

    @Mapping(target = "idEquipement", ignore = true)
    @Mapping(target = "categorie", ignore = true)
    @Mapping(target = "localisation", ignore = true)
    @Mapping(target = "agent", ignore = true)
    EquipementLogiciel toEntity(EquipementLogicielRequest request);

    @Mapping(target = "idEquipement", ignore = true)
    @Mapping(target = "categorie", ignore = true)
    @Mapping(target = "localisation", ignore = true)
    @Mapping(target = "agent", ignore = true)
    EquipementReseau toEntity(EquipementReseauRequest request);
}