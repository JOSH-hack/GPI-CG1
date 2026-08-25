/*

Nom du fichier   : MessageMapper.java
Objectif         : Mapper MapStruct pour Message (Entité ↔ DTO)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.mapper;

import com.golfe1.gpi.dto.request.MessageRequest;
import com.golfe1.gpi.dto.response.MessageResponse;
import com.golfe1.gpi.entities.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { UtilisateurMapper.class })
public interface MessageMapper {

    @Mapping(target = "idMessage", ignore = true)
    @Mapping(target = "dateEnvoi", ignore = true)
    @Mapping(target = "intervention", ignore = true)
    @Mapping(target = "expediteur", ignore = true)
    Message toEntity(MessageRequest request);

    MessageResponse toResponse(Message message);
}