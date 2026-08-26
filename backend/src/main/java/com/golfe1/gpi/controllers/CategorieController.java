/*

Nom du fichier   : CategorieController.java
Objectif         : Endpoints REST pour la gestion des catégories d'équipements
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.CategorieMapper;
import com.golfe1.gpi.dto.request.CategorieRequest;
import com.golfe1.gpi.dto.response.CategorieResponse;
import com.golfe1.gpi.entities.Categorie;
import com.golfe1.gpi.entities.enums.TypeCategorie;
import com.golfe1.gpi.services.CategorieService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategorieController {

    private final CategorieService categorieService;
    private final CategorieMapper categorieMapper;

    public CategorieController(CategorieService categorieService, CategorieMapper categorieMapper) {
        this.categorieService = categorieService;
        this.categorieMapper = categorieMapper;
    }

    // CREATION
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIEN')")
    public ResponseEntity<CategorieResponse> creer(@Valid @RequestBody CategorieRequest request) {
        Categorie categorie = categorieService.creerCategorie(request.getLibelle(), request.getType());
        return ResponseEntity.status(HttpStatus.CREATED).body(categorieMapper.toResponse(categorie));
    }

    // MODIFICATION
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIEN')")
    public ResponseEntity<CategorieResponse> modifier(@PathVariable Long id,
            @Valid @RequestBody CategorieRequest request) {
        Categorie categorie = categorieService.modifierCategorie(id, request.getLibelle(), request.getType());
        return ResponseEntity.ok(categorieMapper.toResponse(categorie));
    }

    // SUPPRESSION
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        categorieService.supprimerCategorie(id);
        return ResponseEntity.noContent().build();
    }

    // CONSULTATION
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIEN') or hasRole('DSI')")
    public ResponseEntity<List<CategorieResponse>> listerToutes() {
        List<Categorie> categories = categorieService.listerToutes();
        List<CategorieResponse> responses = categories.stream()
                .map(categorieMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIEN') or hasRole('DSI')")
    public ResponseEntity<CategorieResponse> getParId(@PathVariable Long id) {
        Categorie categorie = categorieService.getParId(id);
        return ResponseEntity.ok(categorieMapper.toResponse(categorie));
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIEN') or hasRole('DSI')")
    public ResponseEntity<List<CategorieResponse>> listerParType(@PathVariable TypeCategorie type) {
        List<Categorie> categories = categorieService.listerParType(type);
        List<CategorieResponse> responses = categories.stream()
                .map(categorieMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }
}