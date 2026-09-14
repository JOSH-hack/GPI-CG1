/*
 *
 * Nom du fichier   : DocumentController.java
 *
 * Objectif         : Endpoints de generation de documents officiels
 *                    PDF et DOCX.
 *
 * Propriétaire     : Josué BEDEL
 * Date de création : 10/09/2026
 *
 */

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.services.DocumentDocxService;
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
    private final DocumentDocxService documentDocxService;

    public DocumentController(
            DocumentPdfService documentPdfService,
            DocumentDocxService documentDocxService) {
        this.documentPdfService = documentPdfService;
        this.documentDocxService = documentDocxService;
    }

    @GetMapping("/equipement/{id}/fiche-pdf")
    @PreAuthorize("hasRole('ADMIN_INFO') or " +
            "hasRole('ADMIN_SYSTEME') or " +
            "hasRole('TECHNICIEN') or " +
            "hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<ByteArrayResource> ficheEquipementPdf(
            @PathVariable Long id) throws Exception {

        byte[] pdf = documentPdfService.genererFicheEquipement(id);

        return ResponseEntity.ok()
                .contentType(
                        MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"fiche-equipement-" +
                                id +
                                ".pdf\"")
                .body(
                        new ByteArrayResource(pdf));
    }

    @GetMapping("/equipement/{id}/fiche-docx")
    @PreAuthorize("hasRole('ADMIN_INFO') or " +
            "hasRole('ADMIN_SYSTEME') or " +
            "hasRole('TECHNICIEN') or " +
            "hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<ByteArrayResource> ficheEquipementDocx(
            @PathVariable Long id) throws Exception {

        byte[] docx = documentDocxService.genererFicheEquipement(id);

        MediaType mediaType = MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"fiche-equipement-" +
                                id +
                                ".docx\"")
                .body(
                        new ByteArrayResource(docx));
    }
}