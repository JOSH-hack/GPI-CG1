/*

Nom du fichier   : PieceJointeMapper.java
Objectif         : Mapper MapStruct pour PieceJointe (Entité ↔ DTO)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.mapper;

import com.golfe1.gpi.dto.request.PieceJointeRequest;
import com.golfe1.gpi.dto.response.PieceJointeResponse;
import com.golfe1.gpi.entities.PieceJointe;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PieceJointeMapper {

    @Mapping(target = "idPieceJointe", ignore = true)
    @Mapping(target = "vuesRestantes", ignore = true)
    @Mapping(target = "vuesActuelles", ignore = true)
    @Mapping(target = "supprimee", ignore = true)
    @Mapping(target = "supprimeeParTechnicien", ignore = true)
    @Mapping(target = "dateUpload", ignore = true)
    @Mapping(target = "dateExpiration", ignore = true)
    @Mapping(target = "dateSuppression", ignore = true)
    @Mapping(target = "cheminFichier", ignore = true)
    @Mapping(target = "panne", ignore = true)
    PieceJointe toEntity(PieceJointeRequest request);

    // PAS DE @Mapping(target = "cheminFichier", ignore = true)
    // car PieceJointeResponse n'a pas ce champ !
    PieceJointeResponse toResponse(PieceJointe pieceJointe);
}