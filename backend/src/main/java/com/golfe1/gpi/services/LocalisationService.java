/*

Nom du fichier   : LocalisationService.java
Objectif         : Logique métier des localisations (annexes, services, bureaux) - CRUD complet
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Localisation;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.exceptions.ResourceNotFoundException;
import com.golfe1.gpi.repositories.EquipementRepository;
import com.golfe1.gpi.repositories.LocalisationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LocalisationService {

    private final LocalisationRepository localisationRepository;
    private final EquipementRepository equipementRepository;

    public LocalisationService(LocalisationRepository localisationRepository,
            EquipementRepository equipementRepository) {
        this.localisationRepository = localisationRepository;
        this.equipementRepository = equipementRepository;
    }

    @Transactional
    public Localisation creerLocalisation(String annexe, String service, String bureau, String poste) {
        if (annexe == null || annexe.isBlank()) {
            throw new BusinessRuleException("L'annexe est obligatoire");
        }

        Localisation localisation = new Localisation();
        localisation.setAnnexe(annexe);
        localisation.setService(service);
        localisation.setBureau(bureau);
        localisation.setPoste(poste);

        return localisationRepository.save(localisation);
    }

    @Transactional
    public Localisation modifierLocalisation(Long idLocalisation, String annexe, String service,
            String bureau, String poste) {
        Localisation localisation = getLocalisationOuException(idLocalisation);

        if (annexe == null || annexe.isBlank()) {
            throw new BusinessRuleException("L'annexe est obligatoire");
        }

        localisation.setAnnexe(annexe);
        localisation.setService(service);
        localisation.setBureau(bureau);
        localisation.setPoste(poste);

        return localisationRepository.save(localisation);
    }

    @Transactional
    public void supprimerLocalisation(Long idLocalisation) {
        getLocalisationOuException(idLocalisation);

        // Vérifier qu'aucun équipement n'est à cette localisation
        if (!equipementRepository.findByLocalisationIdLocalisation(idLocalisation).isEmpty()) {
            throw new BusinessRuleException(
                    "Impossible de supprimer : des équipements sont affectés à cette localisation");
        }

        localisationRepository.deleteById(idLocalisation);
    }

    public List<Localisation> listerToutes() {
        return localisationRepository.findAll();
    }

    public List<Localisation> rechercherParAnnexe(String annexe) {
        return localisationRepository.findByAnnexeContainingIgnoreCase(annexe);
    }

    public List<Localisation> rechercherParService(String service) {
        return localisationRepository.findByServiceContainingIgnoreCase(service);
    }

    public Localisation getParId(Long idLocalisation) {
        return getLocalisationOuException(idLocalisation);
    }

    private Localisation getLocalisationOuException(Long idLocalisation) {
        return localisationRepository.findById(idLocalisation)
                .orElseThrow(() -> new ResourceNotFoundException("Localisation", idLocalisation));
    }
}