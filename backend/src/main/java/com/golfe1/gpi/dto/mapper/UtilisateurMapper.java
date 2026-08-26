/*

Nom du fichier   : UtilisateurMapper.java
Objectif         : Mapper MapStruct pour Utilisateur (Entité ↔ DTO)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.dto.mapper;

import com.golfe1.gpi.dto.request.UtilisateurRequest;
import com.golfe1.gpi.dto.response.UtilisateurResponse;
import com.golfe1.gpi.entities.Utilisateur;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UtilisateurMapper {

    @Mapping(target = "idUtilisateur", ignore = true)
    @Mapping(target = "actif", ignore = true)
    @Mapping(target = "dateCreation", ignore = true)
    Utilisateur toEntity(UtilisateurRequest request);

    // PAS DE @Mapping(target = "motDePasse", ignore = true)
    // car UtilisateurResponse n'a pas ce champ !
    UtilisateurResponse toResponse(Utilisateur utilisateur);
}