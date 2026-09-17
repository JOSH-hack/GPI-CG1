/*
  *
  * Nom du fichier   : DocumentDocxService.java
  *
  * Objectif         : Génération de la fiche détaillée d'un équipement
  *                    au format DOCX à partir du modèle officiel de
  *                    la Commune du Golfe 1, avec QR Code et historiques.
  *
  * Propriétaire     : Josué BEDEL
  * Date de création : 11/09/2026
  * Date de mise à jour : 14/09/2026
  * Objet de mise à jour : Correction des accès aux sous-types (instanceof),
  *                        alignement getters (getStatut, getLibelle, getAnnexe, getAgent,
 getDateSurvenance),
  *                        utilisation des bonnes méthodes de service (getParId, listerParEquipement).
  */

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Equipement;
import com.golfe1.gpi.entities.EquipementLogiciel;
import com.golfe1.gpi.entities.EquipementMateriel;
import com.golfe1.gpi.entities.EquipementReseau;
import com.golfe1.gpi.entities.HistoriqueMouvement;
import com.golfe1.gpi.entities.Localisation;
import com.golfe1.gpi.entities.Agent;
import com.golfe1.gpi.entities.Panne;
import com.golfe1.gpi.services.EquipementService;
import com.golfe1.gpi.services.HistoriqueMouvementService;
import com.golfe1.gpi.services.PanneService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.*;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.model.datastorage.migration.VariablePrepare;

import java.util.*;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class DocumentDocxService {

        private final EquipementService equipementService;
        private final PanneService panneService;
        private final HistoriqueMouvementService historiqueMouvementService;

        private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy/ HH:mm");
        private static final int QR_CODE_SIZE_EMU = (int) (28 * 914400.0);


        public DocumentDocxService(
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
                        throw new IllegalArgumentException(
                                        "Équipement introuvable avec l'identifiant : " + idEquipement);
                }

                List<Panne> pannes = panneService.listerParEquipement(idEquipement);
                List<HistoriqueMouvement> mouvements = historiqueMouvementService.timelineParEquipement(idEquipement);

                ClassPathResource templateResource = new ClassPathResource("templates/DocumentTypeExport.docx");

                if (!templateResource.exists()) {
                        throw new IOException(
                                        "Le modèle DOCX est introuvable : templates/DocumentTypeExport.docx");
                }

                try (
                                InputStream inputStream = templateResource.getInputStream();
                                XWPFDocument document = new XWPFDocument(inputStream);
                                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

                        nettoyerCorps(document);
                        remplacerVariables(document, equipement);

                        ajouterTitre(document);

                        ajouterIdentification(document, equipement);

                        ajouterInformationsPrincipales(document, equipement);

                        ajouterHistorique(document, pannes, mouvements);

                        document.write(outputStream);

                        return outputStream.toByteArray();
                }
        }

        private void nettoyerCorps(XWPFDocument document) {

                for (int i = document.getBodyElements().size() - 1; i >= 0; i--) {

                        IBodyElement element = document.getBodyElements().get(i);

                        if (element instanceof XWPFParagraph) {
                                document.removeBodyElement(i);
                        } else if (element instanceof XWPFTable) {
                                document.removeBodyElement(i);
                        }
                }
        }

        private void ajouterTitre(XWPFDocument document) {

                XWPFParagraph paragraph = document.createParagraph();

                paragraph.setAlignment(ParagraphAlignment.CENTER);
                paragraph.setSpacingBefore(0);
                paragraph.setSpacingAfter(60);

                XWPFRun run = paragraph.createRun();

                run.setBold(true);
                run.setFontSize(12);
                run.setFontFamily("Arial");
                run.setText("FICHE DÉTAILLÉE DE L'ÉQUIPEMENT");
        }

        private void ajouterIdentification(
                        XWPFDocument document,
                        Equipement equipement) throws Exception {

                XWPFTable table = document.createTable(1, 2);

                table.setWidth("100%");
                table.setCellMargins(60, 60, 60, 60);

                XWPFTableCell informationCell = table.getRow(0).getCell(0);
                XWPFTableCell qrCell = table.getRow(0).getCell(1);

                setCellWidth(informationCell, 75);
                setCellWidth(qrCell, 25);

                clearCell(informationCell);
                clearCell(qrCell);

                XWPFParagraph paragraph = informationCell.getParagraphs().get(0);

                paragraph.setSpacingAfter(0);

                ajouterLigne(
                                paragraph,
                                "Code inventaire : ",
                                valeur(equipement.getCodeInventaire()));

                ajouterLigne(
                                paragraph,
                                "Désignation : ",
                                valeur(equipement.getNom()));

                ajouterLigne(
                                paragraph,
                                "Marque / Modèle : ",
                                valeur(equipement.getMarque()) +
                                                " / " +
                                                valeur(equipement.getModele()));

                ajouterLigne(
                                paragraph,
                                "Numéro de série : ",
                                valeur(equipement.getNumeroSerie()));

                XWPFParagraph qrParagraph = qrCell.getParagraphs().get(0);

                qrParagraph.setAlignment(ParagraphAlignment.CENTER);
                qrParagraph.setSpacingBefore(0);
                qrParagraph.setSpacingAfter(0);

                byte[] qrCode = genererQrCode(equipement);

                try (ByteArrayInputStream qrInputStream = new ByteArrayInputStream(qrCode)) {

                        qrParagraph.createRun().addPicture(
                                        qrInputStream,
                                        XWPFDocument.PICTURE_TYPE_PNG,
                                        "qr-code.png",
                                        QR_CODE_SIZE_EMU,
                                        QR_CODE_SIZE_EMU);
                }

                supprimerBordures(table);

                document.createParagraph().setSpacingAfter(20);
        }

        private void ajouterInformationsPrincipales(
                        XWPFDocument document,
                        Equipement equipement) {

                XWPFTable table = document.createTable(1, 2);

                table.setWidth("100%");
                table.setCellMargins(60, 60, 60, 60);

                XWPFTableCell generalCell = table.getRow(0).getCell(0);
                XWPFTableCell specificCell = table.getRow(0).getCell(1);

                setCellWidth(generalCell, 50);
                setCellWidth(specificCell, 50);

                clearCell(generalCell);
                clearCell(specificCell);

                XWPFParagraph generalParagraph = generalCell.getParagraphs().get(0);

                XWPFParagraph specificParagraph = specificCell.getParagraphs().get(0);

                ajouterTitreCellule(
                                generalParagraph,
                                "INFORMATIONS GÉNÉRALES");

                ajouterLigne(
                                generalParagraph,
                                "Catégorie : ",
                                valeurCategorie(equipement));

                ajouterLigne(
                                generalParagraph,
                                "État : ",
                                valeurEtat(equipement));

                ajouterLigne(
                                generalParagraph,
                                "Localisation : ",
                                valeurLocalisation(equipement));

                ajouterLigne(
                                generalParagraph,
                                "Date d'acquisition : ",
                                formatDate(equipement.getDateAcquisition()));

                ajouterLigne(
                                generalParagraph,
                                "Fin de garantie : ",
                                formatDate(equipement.getFinGarantie()));

                ajouterLigne(
                                generalParagraph,
                                "Coût : ",
                                valeur(equipement.getCoutAcquisition()));

                ajouterLigne(
                                generalParagraph,
                                "Agent affecté : ",
                                valeurAgent(equipement));

                ajouterTitreCellule(
                                specificParagraph,
                                "INFORMATIONS SPÉCIFIQUES");

                // On délègue l'affichage spécifique selon le type réel de l'équipement
                if (equipement instanceof EquipementMateriel) {
                        ajouterHardware(specificParagraph, (EquipementMateriel) equipement);
                } else if (equipement instanceof EquipementLogiciel) {
                        ajouterSoftware(specificParagraph, (EquipementLogiciel) equipement);
                } else if (equipement instanceof EquipementReseau) {
                        ajouterReseau(specificParagraph, (EquipementReseau) equipement);
                } else {
                        ajouterLigne(
                                        specificParagraph,
                                        "Type : ",
                                        valeurCategorie(equipement));
                }

                supprimerBordures(table);

                document.createParagraph().setSpacingAfter(20);
        }

        private void ajouterHardware(
                        XWPFParagraph paragraph,
                        EquipementMateriel hardware) {

                if (hardware == null) {
                        ajouterLigne(paragraph, "Détails : ", "Aucune donnée");
                        return;
                }

                ajouterLigne(
                                paragraph,
                                "Processeur : ",
                                valeur(hardware.getProcesseur()));

                ajouterLigne(
                                paragraph,
                                "RAM : ",
                                valeur(hardware.getRam()));

                ajouterLigne(
                                paragraph,
                                "Disque : ",
                                valeur(hardware.getCapaciteDisque()));

                ajouterLigne(
                                paragraph,
                                "Adresse IP : ",
                                valeur(hardware.getAdresseIp()));

                ajouterLigne(
                                paragraph,
                                "Adresse MAC : ",
                                valeur(hardware.getAdresseMac()));

                ajouterLigne(
                                paragraph,
                                "Système : ",
                                valeur(hardware.getSystemeExploitation()));
        }

        private void ajouterSoftware(
                        XWPFParagraph paragraph,
                        EquipementLogiciel logiciel) {

                if (logiciel == null) {
                        ajouterLigne(paragraph, "Détails : ", "Aucune donnée");
                        return;
                }

                ajouterLigne(
                                paragraph,
                                "Version : ",
                                valeur(logiciel.getVersion()));

                ajouterLigne(
                                paragraph,
                                "Licences : ",
                                valeur(logiciel.getNombreLicences()));

                ajouterLigne(
                                paragraph,
                                "Clé de licence : ",
                                valeur(logiciel.getCleLicence()));

                ajouterLigne(
                                paragraph,
                                "Début licence : ",
                                formatDate(logiciel.getDateDebutLicence()));

                ajouterLigne(
                                paragraph,
                                "Fin licence : ",
                                formatDate(logiciel.getDateExpirationLicence()));
        }

        private void ajouterReseau(
                        XWPFParagraph paragraph,
                        EquipementReseau reseau) {

                if (reseau == null) {
                        ajouterLigne(paragraph, "Détails : ", "Aucune donnée");
                        return;
                }

                ajouterLigne(
                                paragraph,
                                "Type adresse : ",
                                valeur(reseau.getTypeAdresse()));

                ajouterLigne(
                                paragraph,
                                "Adresse IP : ",
                                valeur(reseau.getAdresseIp()));

                ajouterLigne(
                                paragraph,
                                "Adresse MAC : ",
                                valeur(reseau.getAdresseMac()));

                ajouterLigne(
                                paragraph,
                                "Passerelle : ",
                                valeur(reseau.getPasserelle()));

                ajouterLigne(
                                paragraph,
                                "Hostname : ",
                                valeur(reseau.getNomHote()));

                ajouterLigne(
                                paragraph,
                                "Ports : ",
                                valeur(reseau.getNombrePorts()));
        }

        private void ajouterHistorique(
                        XWPFDocument document,
                        List<Panne> pannes,
                        List<HistoriqueMouvement> mouvements) {

                XWPFTable table = document.createTable(1, 2);

                table.setWidth("100%");
                table.setCellMargins(50, 50, 50, 50);

                XWPFTableCell panneCell = table.getRow(0).getCell(0);
                XWPFTableCell mouvementCell = table.getRow(0).getCell(1);

                setCellWidth(panneCell, 50);
                setCellWidth(mouvementCell, 50);

                clearCell(panneCell);
                clearCell(mouvementCell);

                ajouterPannes(panneCell, pannes);
                ajouterMouvements(mouvementCell, mouvements);

                supprimerBordures(table);
        }

        private void ajouterPannes(
                        XWPFTableCell cell,
                        List<Panne> pannes) {

                XWPFParagraph title = cell.getParagraphs().get(0);

                ajouterTitreCellule(title, "HISTORIQUE DES PANNES");

                if (pannes == null || pannes.isEmpty()) {

                        ajouterLigne(
                                        title,
                                        "",
                                        "Aucune panne enregistrée.");

                        return;
                }

                for (Panne panne : pannes) {

                        XWPFParagraph paragraph = cell.addParagraph();

                        paragraph.setSpacingAfter(0);

                        ajouterLigne(
                                        paragraph,
                                        formatDate(panne.getDateSurvenance()) + " : ",
                                        valeur(panne.getDescription()));

                        ajouterLigne(
                                        paragraph,
                                        "Priorité : ",
                                        valeur(panne.getPriorite()));

                        ajouterLigne(
                                        paragraph,
                                        "Statut : ",
                                        valeur(panne.getStatut()));
                }
        }

        private void ajouterMouvements(
                        XWPFTableCell cell,
                        List<HistoriqueMouvement> mouvements) {

                XWPFParagraph title = cell.getParagraphs().get(0);

                ajouterTitreCellule(
                                title,
                                "HISTORIQUE DES MOUVEMENTS");

                if (mouvements == null || mouvements.isEmpty()) {

                        ajouterLigne(
                                        title,
                                        "",
                                        "Aucun mouvement enregistré.");

                        return;
                }

                for (HistoriqueMouvement mouvement : mouvements) {

                        XWPFParagraph paragraph = cell.addParagraph();

                        paragraph.setSpacingAfter(0);

                        ajouterLigne(
                                        paragraph,
                                        "Type : ",
                                        valeur(mouvement.getTypeMouvement()));

                        ajouterLigne(
                                        paragraph,
                                        "Motif : ",
                                        valeur(mouvement.getMotif()));

                        ajouterLigne(
                                        paragraph,
                                        "Ancienne valeur : ",
                                        valeur(mouvement.getAncienneValeur()));

                        ajouterLigne(
                                        paragraph,
                                        "Nouvelle valeur : ",
                                        valeur(mouvement.getNouvelleValeur()));

                        ajouterLigne(
                                        paragraph,
                                        "Opérateur : ",
                                        valeur(mouvement.getOperateur()));

                        ajouterLigne(
                                        paragraph,
                                        "Date : ",
                                        formatDateTime(mouvement.getDateMouvement()));
                }
        }

        private byte[] genererQrCode(
                        Equipement equipement) throws WriterException, IOException {

                String contenu = "GPI-CG1|EQUIPEMENT|"
                                + valeur(equipement.getCodeInventaire())
                                + "|ID|"
                                + equipement.getIdEquipement();

                Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);

                hints.put(
                                EncodeHintType.ERROR_CORRECTION,
                                ErrorCorrectionLevel.M);

                hints.put(
                                EncodeHintType.MARGIN,
                                1);

                BitMatrix matrix = new MultiFormatWriter().encode(
                                contenu,
                                BarcodeFormat.QR_CODE,
                                300,
                                300,
                                hints);

                BufferedImage image = new BufferedImage(
                                matrix.getWidth(),
                                matrix.getHeight(),
                                BufferedImage.TYPE_INT_RGB);

                for (int x = 0; x < matrix.getWidth(); x++) {

                        for (int y = 0; y < matrix.getHeight(); y++) {

                                image.setRGB(
                                                x,
                                                y,
                                                matrix.get(x, y)
                                                                ? 0xFF000000
                                                                : 0xFFFFFFFF);
                        }
                }

                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

                ImageIO.write(
                                image,
                                "PNG",
                                outputStream);

                return outputStream.toByteArray();
        }

        private void ajouterTitreCellule(
                        XWPFParagraph paragraph,
                        String texte) {

                paragraph.setSpacingBefore(0);
                paragraph.setSpacingAfter(40);

                XWPFRun run = paragraph.createRun();

                run.setBold(true);
                run.setFontSize(8);
                run.setFontFamily("Arial");
                run.setText(texte);
        }

        private void ajouterLigne(
                        XWPFParagraph paragraph,
                        String label,
                        String valeur) {

                if (paragraph == null) {
                        return;
                }

                if (label != null && !label.isBlank()) {

                        XWPFRun labelRun = paragraph.createRun();

                        labelRun.setBold(true);
                        labelRun.setFontSize(7);
                        labelRun.setFontFamily("Arial");
                        labelRun.setText(label);
                }

                XWPFRun valueRun = paragraph.createRun();

                valueRun.setFontSize(7);
                valueRun.setFontFamily("Arial");
                valueRun.setText(
                                valeur == null || valeur.isBlank()
                                                ? "N/A"
                                                : valeur);

                valueRun.addBreak();
        }

        private void clearCell(XWPFTableCell cell) {

                while (cell.getParagraphs().size() > 1) {
                        cell.removeParagraph(1);
                }

                XWPFParagraph first = cell.getParagraphs().get(0);

                while (!first.getRuns().isEmpty()) {
                        first.removeRun(0);
                }

                first.setSpacingBefore(0);
                first.setSpacingAfter(0);
        }

        private void setCellWidth(
                        XWPFTableCell cell,
                        int percentage) {

                CTTcPr tcPr = cell.getCTTc().getTcPr();

                if (tcPr == null) {
                        tcPr = cell.getCTTc().addNewTcPr();
                }

                CTTblWidth width = tcPr.isSetTcW()
                                ? tcPr.getTcW()
                                : tcPr.addNewTcW();

                width.setType(STTblWidth.PCT);
                width.setW(String.valueOf(percentage * 50));
        }

        private void supprimerBordures(
                        XWPFTable table) {

                CTTblPr tblPr = table.getCTTbl().getTblPr();

                if (tblPr == null) {
                        tblPr = table.getCTTbl().addNewTblPr();
                }

                CTTblBorders borders = tblPr.isSetTblBorders()
                                ? tblPr.getTblBorders()
                                : tblPr.addNewTblBorders();

                borders.addNewTop().setVal(STBorder.NONE);
                borders.addNewBottom().setVal(STBorder.NONE);
                borders.addNewLeft().setVal(STBorder.NONE);
                borders.addNewRight().setVal(STBorder.NONE);
                borders.addNewInsideH().setVal(STBorder.NONE);
                borders.addNewInsideV().setVal(STBorder.NONE);
        }

        private String valeur(Object valeur) {

                if (valeur == null) {
                        return "N/A";
                }

                String texte = String.valueOf(valeur).trim();

                return texte.isEmpty()
                                ? "N/A"
                                : texte;
        }

        private String valeurCategorie(
                        Equipement equipement) {

                if (equipement.getCategorie() == null) {
                        return "N/A";
                }

                return valeur(
                                equipement.getCategorie().getLibelle());
        }

        private String valeurEtat(
                        Equipement equipement) {

                if (equipement.getStatut() == null) {
                        return "N/A";
                }

                return valeur(
                                equipement.getStatut());
        }

        private String valeurLocalisation(
                        Equipement equipement) {

                Localisation localisation = equipement.getLocalisation();
                if (localisation == null) {
                        return "N/A";
                }

                StringBuilder sb = new StringBuilder();
                sb.append(valeur(localisation.getAnnexe()))
                                .append(" - ")
                                .append(valeur(localisation.getService()));

                String bureau = valeur(localisation.getBureau());
                if (!"N/A".equals(bureau)) {
                        sb.append(" / Bureau ").append(bureau);
                }
                String poste = valeur(localisation.getPoste());
                if (!"N/A".equals(poste)) {
                        sb.append(" / Poste ").append(poste);
                }
                return sb.toString();
        }

        private String valeurAgent(
                        Equipement equipement) {

                Agent agent = equipement.getAgent();
                if (agent == null) {
                        return "Non affecté";
                }

                String nom = valeur(agent.getNom());
                String prenom = valeur(agent.getPrenom());

                if ("N/A".equals(nom) && "N/A".equals(prenom)) {
                        return "Non affecté";
                }
                return nom + " " + prenom;
        }

        private String formatDate(
                        Object date) {

                if (date == null) {
                        return "N/A";
                }

                if (date instanceof LocalDate localDate) {
                        return localDate.format(DATE_FORMAT);
                }

                if (date instanceof LocalDateTime localDateTime) {
                        return localDateTime.format(DATE_TIME_FORMAT);
                }

                return valeur(date);
        }

        private String formatDateTime(
                        Object date) {

                if (date == null) {
                        return "N/A";
                }

                if (date instanceof LocalDateTime localDateTime) {
                        return localDateTime.format(DATE_TIME_FORMAT);
                }

                if (date instanceof LocalDate localDate) {
                        return localDate.format(DATE_FORMAT);
                }

                return valeur(date);
        }

    private void remplacerVariables(XWPFDocument document, Equipement equipement) throws Exception {
        // Docx4j utilise WordprocessingMLPackage, alors que POI utilise XWPFDocument.
        // La logique actuelle utilise POI pour construire le document, mais Docx4j pour remplacer les variables.
        // C'est potentiellement incompatible si on utilise le même document.
        
        // Alternative : Utiliser POI pour faire le remplacement de texte
        for (XWPFParagraph p : document.getParagraphs()) {
            for (XWPFRun r : p.getRuns()) {
                String text = r.getText(0);
                if (text != null && text.contains("$")) {
                    text = text.replace("$codeInventaire", equipement.getCodeInventaire() != null ? equipement.getCodeInventaire() : "");
                    text = text.replace("$nom", equipement.getNom() != null ? equipement.getNom() : "");
                    text = text.replace("$marque", equipement.getMarque() != null ? equipement.getMarque() : "");
                    text = text.replace("$modele", equipement.getModele() != null ? equipement.getModele() : "");
                    text = text.replace("$numeroSerie", equipement.getNumeroSerie() != null ? equipement.getNumeroSerie() : "");
                    text = text.replace("$tagQr", equipement.getTagQr() != null ? equipement.getTagQr() : "");
                    r.setText(text, 0);
                }
            }
        }
        // Faire la même chose pour les tables si nécessaire
        for (XWPFTable tbl : document.getTables()) {
            for (XWPFTableRow row : tbl.getRows()) {
                for (XWPFTableCell cell : row.getTableCells()) {
                    for (XWPFParagraph p : cell.getParagraphs()) {
                        for (XWPFRun r : p.getRuns()) {
                            String text = r.getText(0);
                            if (text != null && text.contains("$")) {
                                text = text.replace("$codeInventaire", equipement.getCodeInventaire() != null ? equipement.getCodeInventaire() : "");
                                text = text.replace("$nom", equipement.getNom() != null ? equipement.getNom() : "");
                                text = text.replace("$marque", equipement.getMarque() != null ? equipement.getMarque() : "");
                                text = text.replace("$modele", equipement.getModele() != null ? equipement.getModele() : "");
                                text = text.replace("$numeroSerie", equipement.getNumeroSerie() != null ? equipement.getNumeroSerie() : "");
                                text = text.replace("$tagQr", equipement.getTagQr() != null ? equipement.getTagQr() : "");
                                r.setText(text, 0);
                            }
                        }
                    }
                }
            }
        }
    }

}