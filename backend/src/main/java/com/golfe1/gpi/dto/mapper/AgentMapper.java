/*

Nom du fichier   : AgentMapper.java
Objectif         : Mapper MapStruct pour Agent (Entité ↔ DTO)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.mapper;

import com.golfe1.gpi.dto.request.AgentRequest;
import com.golfe1.gpi.dto.response.AgentResponse;
import com.golfe1.gpi.entities.Agent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { UtilisateurMapper.class })
public interface AgentMapper {

    @Mapping(target = "idAgent", ignore = true)
    @Mapping(target = "utilisateur", ignore = true) // Set manuellement dans le service
    Agent toEntity(AgentRequest request);

    AgentResponse toResponse(Agent agent);
}