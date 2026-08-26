/*

Nom du fichier   : CategorieService.java
Objectif         : Logique métier des catégories d'équipements - CRUD complet
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Categorie;
import com.golfe1.gpi.entities.enums.TypeCategorie;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.exceptions.ResourceNotFoundException;
import com.golfe1.gpi.repositories.CategorieRepository;
import com.golfe1.gpi.repositories.EquipementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategorieService {

    private final CategorieRepository categorieRepository;
    private final EquipementRepository equipementRepository;

    public CategorieService(CategorieRepository categorieRepository,
            EquipementRepository equipementRepository) {
        this.categorieRepository = categorieRepository;
        this.equipementRepository = equipementRepository;
    }

    @Transactional
    public Categorie creerCategorie(String libelle, TypeCategorie type) {
        if (categorieRepository.existsByLibelle(libelle)) {
            throw new BusinessRuleException("Une catégorie avec ce libellé existe déjà : " + libelle);
        }

        Categorie categorie = new Categorie();
        categorie.setLibelle(libelle);
        categorie.setType(type);

        return categorieRepository.save(categorie);
    }

    @Transactional
    public Categorie modifierCategorie(Long idCategorie, String libelle, TypeCategorie type) {
        Categorie categorie = getCategorieOuException(idCategorie);

        if (!categorie.getLibelle().equals(libelle) && categorieRepository.existsByLibelle(libelle)) {
            throw new BusinessRuleException("Une catégorie avec ce libellé existe déjà : " + libelle);
        }

        categorie.setLibelle(libelle);
        categorie.setType(type);

        return categorieRepository.save(categorie);
    }

    @Transactional
    public void supprimerCategorie(Long idCategorie) {
        getCategorieOuException(idCategorie);

        // Vérifier qu'aucun équipement n'utilise cette catégorie
        if (!equipementRepository.findByCategorieIdCategorie(idCategorie).isEmpty()) {
            throw new BusinessRuleException(
                    "Impossible de supprimer : cette catégorie est utilisée par des équipements");
        }

        categorieRepository.deleteById(idCategorie);
    }

    public List<Categorie> listerToutes() {
        return categorieRepository.findAll();
    }

    public List<Categorie> listerParType(TypeCategorie type) {
        return categorieRepository.findByType(type);
    }

    public Categorie getParId(Long idCategorie) {
        return getCategorieOuException(idCategorie);
    }

    private Categorie getCategorieOuException(Long idCategorie) {
        return categorieRepository.findById(idCategorie)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", idCategorie));
    }
}