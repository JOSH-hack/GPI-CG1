/*

Nom du fichier   : PieceJointeController.java
Objectif         : Endpoints REST pour l'upload, le streaming et la gestion des pièces jointes
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.PieceJointeMapper;
import com.golfe1.gpi.dto.response.PieceJointeResponse;
import com.golfe1.gpi.entities.PieceJointe;
import com.golfe1.gpi.entities.enums.TypePieceJointe;
import com.golfe1.gpi.security.JwtUtil;
import com.golfe1.gpi.services.PieceJointeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pieces-jointes")
public class PieceJointeController {

    private final PieceJointeService pieceJointeService;
    private final PieceJointeMapper pieceJointeMapper;
    private final JwtUtil jwtUtil;

    private final Path uploadDir = Paths.get("uploads/videos");

    public PieceJointeController(PieceJointeService pieceJointeService,
            PieceJointeMapper pieceJointeMapper,
            JwtUtil jwtUtil) throws IOException {
        this.pieceJointeService = pieceJointeService;
        this.pieceJointeMapper = pieceJointeMapper;
        this.jwtUtil = jwtUtil;
        Files.createDirectories(uploadDir);
    }

    // UPLOAD
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<PieceJointeResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long idPanne,
            @RequestParam TypePieceJointe typeFichier,
            HttpServletRequest request) throws IOException {

        // Vérifier le type
        if (typeFichier == TypePieceJointe.VIDEO) {
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("video/")) {
                return ResponseEntity.badRequest().build();
            }
        }

        // Générer un nom unique
        String originalName = file.getOriginalFilename();
        String extension = originalName != null ? originalName.substring(originalName.lastIndexOf(".")) : "";
        String newFileName = "panne_" + idPanne + "_" + UUID.randomUUID() + extension;
        Path targetPath = uploadDir.resolve(newFileName);

        // Sauvegarder sur disque
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Enregistrer en base
        PieceJointe pieceJointe = pieceJointeService.ajouterPieceJointe(idPanne, targetPath.toString(), typeFichier);
        return ResponseEntity.status(HttpStatus.CREATED).body(pieceJointeMapper.toResponse(pieceJointe));
    }

    // STREAMING (compteur de vues)
    @GetMapping("/{id}/stream")
    @PreAuthorize("hasRole('TECHNICIEN') or hasRole('ADMIN') or hasRole('DSI')")
    public ResponseEntity<Resource> stream(@PathVariable Long id) {
        PieceJointe pieceJointe = pieceJointeService.consulter(id);

        if (pieceJointe.getSupprimee() || pieceJointe.getSupprimeeParTechnicien()) {
            return ResponseEntity.status(HttpStatus.GONE).build();
        }

        try {
            Path path = Paths.get(pieceJointe.getCheminFichier());
            Resource resource = new InputStreamResource(Files.newInputStream(path));

            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"video.mp4\"")
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // SUPPRESSION MANUELLE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TECHNICIEN') or hasRole('ADMIN')")
    public ResponseEntity<PieceJointeResponse> supprimer(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long idTechnicien = extraireIdUtilisateur(request);
        PieceJointe pieceJointe = pieceJointeService.supprimerParTechnicien(id);
        return ResponseEntity.ok(pieceJointeMapper.toResponse(pieceJointe));
    }

    // CONSULTATION
    @GetMapping("/panne/{idPanne}")
    @PreAuthorize("hasRole('TECHNICIEN') or hasRole('ADMIN') or hasRole('DSI')")
    public ResponseEntity<List<PieceJointeResponse>> listerParPanne(@PathVariable Long idPanne) {
        List<PieceJointe> pieces = pieceJointeService.listerParPanne(idPanne);
        List<PieceJointeResponse> responses = pieces.stream()
                .map(pieceJointeMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    // UTILITAIRE
    private Long extraireIdUtilisateur(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}