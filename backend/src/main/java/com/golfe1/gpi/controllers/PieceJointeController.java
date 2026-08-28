/*

Nom du fichier   : PieceJointeController.java
Objectif         : Endpoints REST pour l'upload, le streaming et la gestion
                     des pièces jointes - stockage organisé en sous-dossier par panne (uploads/pieces-jointes/{idPanne}/)
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026
Date de mise à jour : 26/08/2026
Objet de mise à jour : Migration vers uploads/pieces-jointes/{idPanne}/ 
                        (au lieu d'un dossier plat uploads/videos), 
                        chemin de base injecté depuis application.properties 
                        (app.upload.dir), correction des roles RBAC dans 
                        @PreAuthorize (ADMIN -> ADMIN_INFO, DSI -> RESPONSABLE_DSI, ajout ADMIN_SYSTEME), correction du nom de fichier dans Content-Disposition (etait fige a "video.mp4")

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.PieceJointeMapper;
import com.golfe1.gpi.dto.response.PieceJointeResponse;
import com.golfe1.gpi.entities.PieceJointe;
import com.golfe1.gpi.entities.enums.TypePieceJointe;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.security.JwtUtil;
import com.golfe1.gpi.services.PieceJointeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
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
    private final Path uploadBaseDir;

    public PieceJointeController(PieceJointeService pieceJointeService,
            PieceJointeMapper pieceJointeMapper,
            JwtUtil jwtUtil,
            @Value("${app.upload.dir}") String uploadDirProperty) throws IOException {
        this.pieceJointeService = pieceJointeService;
        this.pieceJointeMapper = pieceJointeMapper;
        this.jwtUtil = jwtUtil;
        this.uploadBaseDir = Paths.get(uploadDirProperty);
        Files.createDirectories(uploadBaseDir);
    }

    // UPLOAD - stocke dans uploads/pieces-jointes/{idPanne}/nom-unique.ext
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('AGENT') or hasRole('TECHNICIEN') or hasRole('ADMIN_INFO')")
    public ResponseEntity<PieceJointeResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long idPanne,
            @RequestParam TypePieceJointe typeFichier,
            HttpServletRequest request) throws IOException {

        if (file.isEmpty()) {
            throw new BusinessRuleException("Le fichier envoye est vide");
        }

        if (typeFichier == TypePieceJointe.VIDEO) {
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("video/")) {
                return ResponseEntity.badRequest().build();
            }
        }

        // Sous-dossier dedie a cette panne : uploads/pieces-jointes/{idPanne}/
        Path dossierPanne = uploadBaseDir.resolve(String.valueOf(idPanne));
        Files.createDirectories(dossierPanne);

        String originalName = file.getOriginalFilename();
        String extension = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf("."))
                : "";
        String newFileName = UUID.randomUUID() + extension;
        Path targetPath = dossierPanne.resolve(newFileName);

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        PieceJointe pieceJointe = pieceJointeService.ajouterPieceJointe(idPanne, targetPath.toString(), typeFichier);
        return ResponseEntity.status(HttpStatus.CREATED).body(pieceJointeMapper.toResponse(pieceJointe));
    }

    // STREAMING (decompte une vue via PieceJointeService.consulter)
    @GetMapping("/{id}/stream")
    @PreAuthorize("hasRole('TECHNICIEN') or hasRole('ADMIN_INFO') or hasRole('RESPONSABLE_DSI') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<Resource> stream(@PathVariable Long id) {
        PieceJointe pieceJointe = pieceJointeService.consulter(id);

        try {
            Path path = Paths.get(pieceJointe.getCheminFichier());
            Resource resource = new InputStreamResource(Files.newInputStream(path));

            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            String nomFichierAffiche = path.getFileName().toString();

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nomFichierAffiche + "\"")
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // SUPPRESSION MANUELLE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TECHNICIEN') or hasRole('ADMIN_INFO')")
    public ResponseEntity<PieceJointeResponse> supprimer(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long idTechnicien = extraireIdUtilisateur(request);
        PieceJointe pieceJointe = pieceJointeService.supprimerParTechnicien(id, idTechnicien);
        return ResponseEntity.ok(pieceJointeMapper.toResponse(pieceJointe));
    }

    // CONSULTATION - liste des pieces jointes actives d'une panne
    @GetMapping("/panne/{idPanne}")
    @PreAuthorize("hasRole('TECHNICIEN') or hasRole('ADMIN_INFO') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<List<PieceJointeResponse>> listerParPanne(@PathVariable Long idPanne) {
        List<PieceJointe> pieces = pieceJointeService.listerParPanne(idPanne);
        List<PieceJointeResponse> responses = pieces.stream()
                .map(pieceJointeMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    private Long extraireIdUtilisateur(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}