/*

Nom du fichier   : ExportController.java
Objectif         : Endpoints de téléchargement des exports Excel et PDF de la page Statistiques
Propriétaire     : Josué BEDEL
Date de création : 26/08/2026

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.services.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/exports/statistiques")
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/excel")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('RESPONSABLE_DSI') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN')")
    public ResponseEntity<byte[]> exporterExcel() throws Exception {
        ExportService.StatistiquesData data = exportService.collecterDonnees();
        byte[] fichier = exportService.genererExcel(data);

        String nomFichier = "statistiques-gpi-" + LocalDate.now() + ".xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nomFichier + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(fichier);
    }

    @GetMapping("/pdf")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('RESPONSABLE_DSI') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN')")
    public ResponseEntity<byte[]> exporterPdf() throws Exception {
        ExportService.StatistiquesData data = exportService.collecterDonnees();
        byte[] fichier = exportService.genererPdf(data);

        String nomFichier = "statistiques-gpi-" + LocalDate.now() + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nomFichier + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(fichier);
    }
}