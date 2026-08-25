/*

Nom du fichier   : PanneMapper.java
Objectif         : Mapper MapStruct pour Panne (Entité ↔ DTO)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.mapper;

import com.golfe1.gpi.dto.request.PanneRequest;
import com.golfe1.gpi.dto.response.PanneResponse;
import com.golfe1.gpi.entities.Panne;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { EquipementMapper.class, UtilisateurMapper.class })
public interface PanneMapper {

    @Mapping(target = "idPanne", ignore = true)
    @Mapping(target = "statut", ignore = true)
    @Mapping(target = "noteSatisfaction", ignore = true)
    @Mapping(target = "dateSurvenance", ignore = true)
    @Mapping(target = "equipement", ignore = true)
    @Mapping(target = "utilisateurSignaleur", ignore = true)
    Panne toEntity(PanneRequest request);

    PanneResponse toResponse(Panne panne);
}