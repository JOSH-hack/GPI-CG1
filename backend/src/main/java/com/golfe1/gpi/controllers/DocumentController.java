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

import com.golfe1.gpi.dto.request.ExportRequest;
import com.golfe1.gpi.services.DocumentDocxService;
import com.golfe1.gpi.services.DocumentPdfService;
import com.golfe1.gpi.services.ExportGeneratorFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

        private final DocumentPdfService documentPdfService;
        private final DocumentDocxService documentDocxService;
        private final ExportGeneratorFactory exportGeneratorFactory;

        public DocumentController(
                        DocumentPdfService documentPdfService,
                        DocumentDocxService documentDocxService,
                        ExportGeneratorFactory exportGeneratorFactory) {
                this.documentPdfService = documentPdfService;
                this.documentDocxService = documentDocxService;
                this.exportGeneratorFactory = exportGeneratorFactory;
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
                                .contentType(MediaType.APPLICATION_PDF)
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"fiche-equipement-" + id + ".pdf\"")
                                .body(new ByteArrayResource(pdf));
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
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"fiche-equipement-" + id + ".docx\"")
                                .body(new ByteArrayResource(docx));
        }

        @PostMapping("/export/generate")
        @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('TECHNICIEN')")
        public ResponseEntity<ByteArrayResource> genererDocumentEdite(
                        @RequestBody ExportRequest request) throws Exception {

                byte[] fichier = exportGeneratorFactory.generer(request);

                String format = request.getFormat();

                String extension = format.equalsIgnoreCase("PDF")
                                ? "pdf"
                                : format.equalsIgnoreCase("DOCX") ? "docx" : "xlsx";

                String contentType = format.equalsIgnoreCase("PDF")
                                ? "application/pdf"
                                : format.equalsIgnoreCase("DOCX")
                                                ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                return ResponseEntity.ok()
                                .contentType(MediaType.parseMediaType(contentType))
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"export-" + request.getIdEquipement() + "."
                                                                + extension + "\"")
                                .body(new ByteArrayResource(fichier));
        }
}