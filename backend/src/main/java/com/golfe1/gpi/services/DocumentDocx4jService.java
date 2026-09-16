package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.*;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.openpackaging.parts.WordprocessingML.MainDocumentPart;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class DocumentDocx4jService {

    private final EquipementService equipementService;
    private final PanneService panneService;
    private final HistoriqueMouvementService historiqueMouvementService;

    public DocumentDocx4jService(
            EquipementService equipementService,
            PanneService panneService,
            HistoriqueMouvementService historiqueMouvementService) {
        this.equipementService = equipementService;
        this.panneService = panneService;
        this.historiqueMouvementService = historiqueMouvementService;
    }

    public byte[] genererFicheEquipement(Long idEquipement) throws Exception {
        Equipement equipement = equipementService.getParId(idEquipement);

        if (equipement == null) {
            throw new IllegalArgumentException("Équipement introuvable : " + idEquipement);
        }

        // Charger le modèle
        ClassPathResource templateResource = new ClassPathResource("templates/DocumentTypeExport.docx");
        try (InputStream inputStream = templateResource.getInputStream()) {
            WordprocessingMLPackage wordMLPackage = WordprocessingMLPackage.load(inputStream);
            MainDocumentPart mainDocumentPart = wordMLPackage.getMainDocumentPart();

            // TODO: Implémenter la logique de modification du document avec docx4j
            // 1. Nettoyer le contenu existant si nécessaire
            // 2. Ajouter le contenu dynamique
            // 3. Ajouter le QR code
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            wordMLPackage.save(outputStream);
            return outputStream.toByteArray();
        }
    }
}
