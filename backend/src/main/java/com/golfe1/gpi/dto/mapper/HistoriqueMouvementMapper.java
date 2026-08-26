/*

Nom du fichier   : HistoriqueMouvementMapper.java
Objectif         : Mapper MapStruct pour HistoriqueMouvement (Entité → DTO uniquement)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.mapper;

import com.golfe1.gpi.dto.response.HistoriqueMouvementResponse;
import com.golfe1.gpi.entities.HistoriqueMouvement;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = { EquipementMapper.class, UtilisateurMapper.class })
public interface HistoriqueMouvementMapper {

    HistoriqueMouvementResponse toResponse(HistoriqueMouvement mouvement);
}