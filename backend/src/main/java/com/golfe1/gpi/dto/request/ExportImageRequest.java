/*
 *
 * Nom du fichier   : ExportImageRequest.java
 *
 * Objectif         : Corps de requete pour l'export PDF par capture
 *                    d'image (une image PNG par page, deja rendue cote
 *                    frontend a partir de l'editeur de fiche equipement).
 *
 * PropriÃ©taire     : JosuÃ© BEDEL
 * Date de crÃ©ation : 19/09/2026
 *
 */

package com.golfe1.gpi.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class ExportImageRequest {

    private Long idEquipement;

    // Chaque element est une image PNG encodee en base64, avec ou sans
    // prefixe "data:image/png;base64," (les deux formes sont acceptees
    // cote service), une entree = une page du PDF final, dans l'ordre.
    private List<String> images;
}