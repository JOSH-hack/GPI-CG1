/*

Nom du fichier   : ExportService.java
Objectif         : Génération des exports Excel et PDF de la page 
                    Statistiques - collecte les indicateurs clés 
                    (taux de résolution, temps moyen, satisfaction)
                     et le détail des équipements
Propriétaire     : Josué BEDEL
Date de création : 26/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Equipement;
import com.golfe1.gpi.entities.Intervention;
import com.golfe1.gpi.entities.Panne;
import com.golfe1.gpi.entities.enums.StatutPanne;
import com.golfe1.gpi.repositories.EquipementRepository;
import com.golfe1.gpi.repositories.InterventionRepository;
import com.golfe1.gpi.repositories.PanneRepository;
// iText (PDF)
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.PageSize;
// POI (Excel)
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    private final EquipementRepository equipementRepository;
    private final PanneRepository panneRepository;
    private final InterventionRepository interventionRepository;

    public ExportService(EquipementRepository equipementRepository,
            PanneRepository panneRepository,
            InterventionRepository interventionRepository) {
        this.equipementRepository = equipementRepository;
        this.panneRepository = panneRepository;
        this.interventionRepository = interventionRepository;
    }

    // --- Collecte des donnees (une seule fois, partagee entre Excel et PDF) ---
    @Transactional(readOnly = true)
    public StatistiquesData collecterDonnees() {
        StatistiquesData data = new StatistiquesData();

        List<Equipement> equipements = equipementRepository.findAll();
        data.equipements = equipements;

        List<Panne> pannes = panneRepository.findAll();
        long totalPannes = pannes.size();
        long pannesReparees = pannes.stream().filter(p -> p.getStatut() == StatutPanne.REPAREE).count();
        data.totalPannes = totalPannes;
        data.tauxResolution = totalPannes == 0 ? 0.0 : (pannesReparees * 100.0 / totalPannes);

        data.satisfactionMoyenne = pannes.stream()
                .filter(p -> p.getNoteSatisfaction() != null)
                .mapToInt(p -> p.getNoteSatisfaction())
                .average()
                .orElse(0.0);

        List<Intervention> interventions = interventionRepository.findAll();
        data.tempsMoyenResolutionHeures = interventions.stream()
                .filter(i -> i.getDateResolution() != null)
                .mapToLong(i -> Duration.between(i.getDateIntervention(), i.getDateResolution()).toMinutes())
                .average()
                .orElse(0.0) / 60.0;

        return data;
    }

    // --- Export EXCEL (feuille Indicateurs + feuille Detail des equipements) ---
    public byte[] genererExcel(StatistiquesData data) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            CellStyle styleEntete = creerStyleEntete(workbook);

            Sheet sheetKpi = workbook.createSheet("Indicateurs");
            int rowIdx = 0;
            org.apache.poi.ss.usermodel.Row header = sheetKpi.createRow(rowIdx++);
            creerCellule(header, 0, "Indicateur", styleEntete);
            creerCellule(header, 1, "Valeur", styleEntete);

            ajouterLigneKpi(sheetKpi, rowIdx++, "Nombre total de pannes", String.valueOf(data.totalPannes));
            ajouterLigneKpi(sheetKpi, rowIdx++, "Taux de resolution (%)",
                    String.format("%.1f", data.tauxResolution));
            ajouterLigneKpi(sheetKpi, rowIdx++, "Temps moyen de resolution (h)",
                    String.format("%.1f", data.tempsMoyenResolutionHeures));
            ajouterLigneKpi(sheetKpi, rowIdx, "Satisfaction moyenne (/5)",
                    String.format("%.1f", data.satisfactionMoyenne));

            sheetKpi.autoSizeColumn(0);
            sheetKpi.autoSizeColumn(1);

            Sheet sheetEquipements = workbook.createSheet("Detail des equipements");
            String[] colonnes = { "Code inventaire", "Nom", "Categorie", "Localisation", "Statut",
                    "Date acquisition" };
            org.apache.poi.ss.usermodel.Row headerEq = sheetEquipements.createRow(0);
            for (int i = 0; i < colonnes.length; i++) {
                creerCellule(headerEq, i, colonnes[i], styleEntete);
            }

            int r = 1;
            for (Equipement e : data.equipements) {
                org.apache.poi.ss.usermodel.Row row = sheetEquipements.createRow(r++);
                row.createCell(0).setCellValue(e.getCodeInventaire());
                row.createCell(1).setCellValue(e.getNom());
                row.createCell(2).setCellValue(e.getCategorie() != null ? e.getCategorie().getLibelle() : "-");
                row.createCell(3).setCellValue(e.getLocalisation() != null
                        ? e.getLocalisation().getAnnexe() + " - " + e.getLocalisation().getService()
                        : "-");
                row.createCell(4).setCellValue(e.getStatut().name());
                row.createCell(5).setCellValue(
                        e.getDateAcquisition() != null ? e.getDateAcquisition().toString() : "-");
            }
            for (int i = 0; i < colonnes.length; i++) {
                sheetEquipements.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // --- Export PDF (indicateurs + tableau equipements) ---
    public byte[] genererPdf(StatistiquesData data) throws DocumentException, IOException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        Font titreFont = new Font(Font.HELVETICA, 16, Font.BOLD);
        Font sousTitreFont = new Font(Font.HELVETICA, 12, Font.BOLD);
        Font normalFont = new Font(Font.HELVETICA, 10, Font.NORMAL);

        Paragraph titre = new Paragraph("GPI - Statistiques - Commune du Golfe 1", titreFont);
        titre.setAlignment(Element.ALIGN_CENTER);
        document.add(titre);

        Paragraph dateGeneration = new Paragraph(
                "Genere le " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy a HH:mm")),
                normalFont);
        dateGeneration.setAlignment(Element.ALIGN_CENTER);
        dateGeneration.setSpacingAfter(20);
        document.add(dateGeneration);

        document.add(new Paragraph("Indicateurs cles", sousTitreFont));
        PdfPTable tableKpi = new PdfPTable(2);
        tableKpi.setWidthPercentage(100);
        tableKpi.setSpacingBefore(10);
        tableKpi.setSpacingAfter(20);
        ajouterLigneKpiPdf(tableKpi, "Nombre total de pannes", String.valueOf(data.totalPannes), normalFont);
        ajouterLigneKpiPdf(tableKpi, "Taux de resolution",
                String.format("%.1f %%", data.tauxResolution), normalFont);
        ajouterLigneKpiPdf(tableKpi, "Temps moyen de resolution",
                String.format("%.1f h", data.tempsMoyenResolutionHeures), normalFont);
        ajouterLigneKpiPdf(tableKpi, "Satisfaction moyenne",
                String.format("%.1f / 5", data.satisfactionMoyenne), normalFont);
        document.add(tableKpi);

        document.add(new Paragraph("Detail des equipements", sousTitreFont));
        PdfPTable tableEquipements = new PdfPTable(5);
        tableEquipements.setWidthPercentage(100);
        tableEquipements.setSpacingBefore(10);
        String[] entetes = { "Code inventaire", "Nom", "Categorie", "Localisation", "Statut" };
        for (String entete : entetes) {
            PdfPCell cell = new PdfPCell(new Phrase(entete, sousTitreFont));
            cell.setBackgroundColor(Color.LIGHT_GRAY);
            tableEquipements.addCell(cell);
        }
        for (Equipement e : data.equipements) {
            tableEquipements.addCell(new Phrase(e.getCodeInventaire(), normalFont));
            tableEquipements.addCell(new Phrase(e.getNom(), normalFont));
            tableEquipements.addCell(
                    new Phrase(e.getCategorie() != null ? e.getCategorie().getLibelle() : "-", normalFont));
            tableEquipements.addCell(new Phrase(e.getLocalisation() != null
                    ? e.getLocalisation().getAnnexe() + " - " + e.getLocalisation().getService()
                    : "-", normalFont));
            tableEquipements.addCell(new Phrase(e.getStatut().name(), normalFont));
        }
        document.add(tableEquipements);

        document.close();
        return out.toByteArray();
    }

    private CellStyle creerStyleEntete(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private void creerCellule(org.apache.poi.ss.usermodel.Row row, int colonne, String valeur, CellStyle style) {
        org.apache.poi.ss.usermodel.Cell cell = row.createCell(colonne);
        cell.setCellValue(valeur);
        cell.setCellStyle(style);
    }

    private void ajouterLigneKpi(Sheet sheet, int rowIdx, String libelle, String valeur) {
        org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(libelle);
        row.createCell(1).setCellValue(valeur);
    }

    private void ajouterLigneKpiPdf(PdfPTable table, String libelle, String valeur, Font font) {
        table.addCell(new Phrase(libelle, font));
        table.addCell(new Phrase(valeur, font));
    }

    // --- Structure interne de transport des donnees collectees ---
    public static class StatistiquesData {
        private List<Equipement> equipements;
        private long totalPannes;
        private double tauxResolution;
        private double tempsMoyenResolutionHeures;
        private double satisfactionMoyenne;
    }
}