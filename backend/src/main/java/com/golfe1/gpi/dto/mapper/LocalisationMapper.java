/*

Nom du fichier   : LocalisationMapper.java
Objectif         : Mapper MapStruct pour Localisation (Entité ↔ DTO)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.mapper;

import com.golfe1.gpi.dto.request.LocalisationRequest;
import com.golfe1.gpi.dto.response.LocalisationResponse;
import com.golfe1.gpi.entities.Localisation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LocalisationMapper {

    @Mapping(target = "idLocalisation", ignore = true)
    Localisation toEntity(LocalisationRequest request);

    LocalisationResponse toResponse(Localisation localisation);
}