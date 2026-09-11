/*

Nom du fichier   : DocumentPdfService.java
Objectif         : Generation de la Fiche detaillee equipement en PDF officiel
                    (en-tete Mairie + infos generales/specifiques + historiques
                    pannes/mouvements) - premiere utilisation du gabarit
                    EnTeteMairiePdf, destine a etre reutilise pour d'autres
                    documents (rapports d'intervention, etc.)
Propriétaire     : Josué BEDEL
Date de création : 10/09/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.*;
import com.golfe1.gpi.pdf.EnTeteMairiePdf;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class DocumentPdfService {

    private final EquipementService equipementService;
    private final PanneService panneService;
    private final HistoriqueMouvementService historiqueMouvementService;

    private static final Font FONT_LABEL = new Font(Font.HELVETICA, 9, Font.BOLD);
    private static final Font FONT_VALEUR = new Font(Font.HELVETICA, 9, Font.NORMAL);
    private static final Font FONT_SECTION = new Font(Font.HELVETICA, 11, Font.BOLD);
    private static final DateTimeFormatter FORMAT_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public DocumentPdfService(EquipementService equipementService,
            PanneService panneService,
            HistoriqueMouvementService historiqueMouvementService) {
        this.equipementService = equipementService;
        this.panneService = panneService;
        this.historiqueMouvementService = historiqueMouvementService;
    }

    public byte[] genererFicheEquipement(Long idEquipement) throws DocumentException, IOException {
        Equipement equipement = equipementService.getParId(idEquipement);
        List<Panne> pannes = panneService.listerParEquipement(idEquipement);
        List<HistoriqueMouvement> mouvements = historiqueMouvementService.listerParEquipement(idEquipement);

        Document document = new Document(PageSize.A4, 36, 36, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        EnTeteMairiePdf.ajouterEnTete(document, "FICHE DETAILLEE EQUIPEMENT");

        document.add(section("Informations Generales"));
        PdfPTable general = nouvelleTableInfo();
        ligne(general, "Nom", equipement.getNom());
        ligne(general, "Code inventaire", equipement.getCodeInventaire());
        ligne(general, "Marque / Modele", vide(equipement.getMarque()) + " " + vide(equipement.getModele()));
        ligne(general, "Numero de serie", equipement.getNumeroSerie());
        ligne(general, "Date d'acquisition", formaterDate(equipement.getDateAcquisition()));
        ligne(general, "Fin de garantie", formaterDate(equipement.getFinGarantie()));
        ligne(general, "Cout d'acquisition",
                equipement.getCoutAcquisition() != null ? equipement.getCoutAcquisition() + " FCFA" : "-");
        ligne(general, "Categorie", equipement.getCategorie() != null ? equipement.getCategorie().getLibelle() : "-");
        ligne(general, "Statut", equipement.getStatut() != null ? equipement.getStatut().name() : "-");
        ligne(general, "Localisation", libelleLocalisation(equipement.getLocalisation()));
        ligne(general, "Agent affecte", libelleAgent(equipement.getAgent()));
        document.add(general);

        document.add(new Paragraph(" "));
        document.add(section("Informations Specifiques"));
        PdfPTable specifique = nouvelleTableInfo();
        ajouterInfosSpecifiques(specifique, equipement);
        document.add(specifique);

        document.add(new Paragraph(" "));
        document.add(section("Historique des Pannes"));
        document.add(tableHistoriquePannes(pannes));

        document.add(new Paragraph(" "));
        document.add(section("Historique des Mouvements"));
        document.add(tableHistoriqueMouvements(mouvements));

        EnTeteMairiePdf.ajouterPiedDePage(document);

        document.close();
        return out.toByteArray();
    }

    private void ajouterInfosSpecifiques(PdfPTable table, Equipement equipement) {
        if (equipement instanceof EquipementMateriel materiel) {
            ligne(table, "Processeur", materiel.getProcesseur());
            ligne(table, "RAM", materiel.getRam());
            ligne(table, "Capacite stockage", materiel.getCapaciteDisque());
            ligne(table, "Adresse IP", materiel.getAdresseIp());
            ligne(table, "Adresse MAC", materiel.getAdresseMac());
            ligne(table, "Systeme d'exploitation", materiel.getSystemeExploitation());
        } else if (equipement instanceof EquipementLogiciel logiciel) {
            ligne(table, "Version", logiciel.getVersion());
            ligne(table, "Nombre de licences",
                    logiciel.getNombreLicences() != null ? String.valueOf(logiciel.getNombreLicences()) : "-");
            ligne(table, "Cle de licence", logiciel.getCleLicence());
            ligne(table, "Debut de licence", formaterDate(logiciel.getDateDebutLicence()));
            ligne(table, "Expiration licence", formaterDate(logiciel.getDateExpirationLicence()));
        } else if (equipement instanceof EquipementReseau reseau) {
            ligne(table, "Type d'adresse", reseau.getTypeAdresse() != null ? reseau.getTypeAdresse().name() : "-");
            ligne(table, "Adresse IP", reseau.getAdresseIp());
            ligne(table, "Adresse MAC", reseau.getAdresseMac());
            ligne(table, "Passerelle", reseau.getPasserelle());
            ligne(table, "Masque", reseau.getMasqueSousReseau());
            ligne(table, "Nom d'hote", reseau.getNomHote());
            ligne(table, "Nombre de ports",
                    reseau.getNombrePorts() != null ? String.valueOf(reseau.getNombrePorts()) : "-");
        }
    }

    private PdfPTable tableHistoriquePannes(List<Panne> pannes) {
        PdfPTable table = new PdfPTable(new float[] { 2, 4, 2, 2 });
        table.setWidthPercentage(100);
        for (String entete : new String[] { "Date", "Description", "Priorite", "Statut" }) {
            table.addCell(enteteTableau(entete));
        }
        if (pannes.isEmpty()) {
            PdfPCell vide = new PdfPCell(new Phrase("Aucune panne enregistree", FONT_VALEUR));
            vide.setColspan(4);
            table.addCell(vide);
        } else {
            for (Panne p : pannes) {
                table.addCell(new Phrase(
                        p.getDateSurvenance() != null ? p.getDateSurvenance().format(FORMAT_DATE) : "-", FONT_VALEUR));
                table.addCell(new Phrase(vide(p.getDescription()), FONT_VALEUR));
                table.addCell(new Phrase(p.getPriorite() != null ? p.getPriorite().name() : "-", FONT_VALEUR));
                table.addCell(new Phrase(p.getStatut() != null ? p.getStatut().name() : "-", FONT_VALEUR));
            }
        }
        return table;
    }

    private PdfPTable tableHistoriqueMouvements(List<HistoriqueMouvement> mouvements) {
        PdfPTable table = new PdfPTable(new float[] { 2, 3, 2, 2, 2, 2 });
        table.setWidthPercentage(100);
        for (String entete : new String[] { "Type", "Motif", "Ancienne valeur", "Nouvelle valeur", "Operateur",
                "Date" }) {
            table.addCell(enteteTableau(entete));
        }
        if (mouvements.isEmpty()) {
            PdfPCell vide = new PdfPCell(new Phrase("Aucun mouvement enregistre", FONT_VALEUR));
            vide.setColspan(6);
            table.addCell(vide);
        } else {
            for (HistoriqueMouvement m : mouvements) {
                table.addCell(
                        new Phrase(m.getTypeMouvement() != null ? m.getTypeMouvement().name() : "-", FONT_VALEUR));
                table.addCell(new Phrase(vide(m.getMotif()), FONT_VALEUR));
                table.addCell(new Phrase(vide(m.getAncienneValeur()), FONT_VALEUR));
                table.addCell(new Phrase(vide(m.getNouvelleValeur()), FONT_VALEUR));
                table.addCell(new Phrase(m.getOperateur() != null ? m.getOperateur().getNom() : "-", FONT_VALEUR));
                table.addCell(new Phrase(
                        m.getDateMouvement() != null ? m.getDateMouvement().format(FORMAT_DATE) : "-", FONT_VALEUR));
            }
        }
        return table;
    }

    private PdfPCell enteteTableau(String texte) {
        Font fontEntete = new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE);
        PdfPCell cell = new PdfPCell(new Phrase(texte, fontEntete));
        cell.setBackgroundColor(new Color(12, 93, 125));
        cell.setPadding(4);
        return cell;
    }

    private Paragraph section(String titre) {
        Paragraph p = new Paragraph(titre, FONT_SECTION);
        p.setSpacingBefore(10);
        p.setSpacingAfter(6);
        return p;
    }

    private PdfPTable nouvelleTableInfo() {
        PdfPTable table = new PdfPTable(new float[] { 1, 2 });
        table.setWidthPercentage(100);
        return table;
    }

    private void ligne(PdfPTable table, String label, String valeur) {
        PdfPCell celluleLabel = new PdfPCell(new Phrase(label, FONT_LABEL));
        celluleLabel.setBorder(Rectangle.BOTTOM);
        celluleLabel.setBorderColor(Color.LIGHT_GRAY);
        celluleLabel.setPadding(3);
        table.addCell(celluleLabel);

        PdfPCell celluleValeur = new PdfPCell(new Phrase(vide(valeur), FONT_VALEUR));
        celluleValeur.setBorder(Rectangle.BOTTOM);
        celluleValeur.setBorderColor(Color.LIGHT_GRAY);
        celluleValeur.setPadding(3);
        table.addCell(celluleValeur);
    }

    private String vide(String valeur) {
        return valeur == null || valeur.isBlank() ? "-" : valeur;
    }

    private String formaterDate(java.time.LocalDate date) {
        return date != null ? date.format(FORMAT_DATE) : "-";
    }

    private String libelleLocalisation(Localisation loc) {
        if (loc == null)
            return "-";
        StringBuilder sb = new StringBuilder();
        if (loc.getAnnexe() != null)
            sb.append(loc.getAnnexe());
        if (loc.getService() != null)
            sb.append(" - ").append(loc.getService());
        if (loc.getBureau() != null)
            sb.append(" - ").append(loc.getBureau());
        return sb.length() == 0 ? "-" : sb.toString();
    }

    private String libelleAgent(Agent agent) {
        if (agent == null)
            return "Non affecte";
        return agent.getNom() + " " + agent.getPrenom()
                + (agent.getFonction() != null ? " - " + agent.getFonction() : "")
                + (agent.getTelephone() != null ? " - " + agent.getTelephone() : "");
    }
}