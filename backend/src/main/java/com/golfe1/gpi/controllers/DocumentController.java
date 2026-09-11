/*

Nom du fichier   : DocumentController.java
Objectif         : Endpoints de generation de documents PDF officiels
                    (fiche equipement pour l'instant, extensible a d'autres
                    types de documents ensuite)
Propriétaire     : Josué BEDEL
Date de création : 10/09/2026

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.services.DocumentPdfService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentPdfService documentPdfService;

    public DocumentController(DocumentPdfService documentPdfService) {
        this.documentPdfService = documentPdfService;
    }

    @GetMapping("/equipement/{id}/fiche-pdf")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<ByteArrayResource> ficheEquipementPdf(@PathVariable Long id) throws Exception {
        byte[] pdf = documentPdfService.genererFicheEquipement(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fiche-equipement-" + id + ".pdf\"")
                .body(new ByteArrayResource(pdf));
    }
}