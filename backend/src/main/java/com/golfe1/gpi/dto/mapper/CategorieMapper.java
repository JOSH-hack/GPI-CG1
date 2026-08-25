/*

Nom du fichier   : CategorieMapper.java
Objectif         : Mapper MapStruct pour Categorie (Entité ↔ DTO)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.mapper;

import com.golfe1.gpi.dto.request.CategorieRequest;
import com.golfe1.gpi.dto.response.CategorieResponse;
import com.golfe1.gpi.entities.Categorie;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategorieMapper {

    @Mapping(target = "idCategorie", ignore = true)
    Categorie toEntity(CategorieRequest request);

    CategorieResponse toResponse(Categorie categorie);
}