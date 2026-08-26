/*

Nom du fichier   : InterventionMapper.java
Objectif         : Mapper MapStruct pour Intervention (Entité ↔ DTO)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.mapper;

import com.golfe1.gpi.dto.request.InterventionRequest;
import com.golfe1.gpi.dto.response.InterventionResponse;
import com.golfe1.gpi.entities.Intervention;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { PanneMapper.class, UtilisateurMapper.class })
public interface InterventionMapper {

    @Mapping(target = "idIntervention", ignore = true)
    @Mapping(target = "dateIntervention", ignore = true)
    @Mapping(target = "dateResolution", ignore = true)
    @Mapping(target = "dateRapport", ignore = true)
    @Mapping(target = "dateValidationDsi", ignore = true)
    @Mapping(target = "panne", ignore = true)
    @Mapping(target = "technicien", ignore = true)
    @Mapping(target = "validateurDsi", ignore = true)
    Intervention toEntity(InterventionRequest request);

    InterventionResponse toResponse(Intervention intervention);
}