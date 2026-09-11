/*

Nom du fichier   : EnTeteMairiePdf.java
Objectif         : En-tete et pied de page officiels (blason, Republique
                    Togolaise, coordonnees) reutilisables pour tout document
                    PDF genere par l'application - fidele au gabarit des
                    documents officiels de la Commune du Golfe 1
Propriétaire     : Josué BEDEL
Date de création : 10/09/2026

*/

package com.golfe1.gpi.pdf;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;

import java.awt.Color;
import java.io.IOException;
import java.io.InputStream;

public final class EnTeteMairiePdf {

    private EnTeteMairiePdf() {
    }

    private static final Font FONT_MINISTERE = new Font(Font.HELVETICA, 7, Font.NORMAL);
    private static final Font FONT_COMMUNE = new Font(Font.HELVETICA, 8, Font.BOLD);
    private static final Font FONT_REPUBLIQUE = new Font(Font.HELVETICA, 11, Font.BOLD);
    private static final Font FONT_DEVISE = new Font(Font.HELVETICA, 9, Font.NORMAL);
    private static final Font FONT_TITRE = new Font(Font.HELVETICA, 13, Font.BOLD);
    private static final Font FONT_PIED = new Font(Font.HELVETICA, 7, Font.NORMAL, Color.DARK_GRAY);

    public static void ajouterEnTete(Document document, String titreDocument) throws DocumentException, IOException {
        PdfPTable enTete = new PdfPTable(new float[] { 1, 3, 2 });
        enTete.setWidthPercentage(100);

        // Colonne gauche : blason + ministere/prefecture/commune
        PdfPCell celluleBlason = new PdfPCell();
        celluleBlason.setBorder(Rectangle.NO_BORDER);
        try (InputStream in = EnTeteMairiePdf.class.getResourceAsStream("/static/blason-mairie.png")) {
            if (in != null) {
                Image blason = Image.getInstance(in.readAllBytes());
                blason.scaleToFit(55, 55);
                celluleBlason.addElement(blason);
            }
        }
        enTete.addCell(celluleBlason);

        PdfPCell celluleMinistere = new PdfPCell();
        celluleMinistere.setBorder(Rectangle.NO_BORDER);
        celluleMinistere.addElement(new Paragraph(
                "MINISTERE DE L'ADMINISTRATION TERRITORIALE\nDE LA GOUVERNANCE LOCALE ET DES AFFAIRES COUTUMIERES",
                FONT_MINISTERE));
        celluleMinistere.addElement(new Paragraph("----------", FONT_MINISTERE));
        celluleMinistere.addElement(new Paragraph("REGION MARITIME", FONT_MINISTERE));
        celluleMinistere.addElement(new Paragraph("----------", FONT_MINISTERE));
        celluleMinistere.addElement(new Paragraph("PREFECTURE DU GOLFE", FONT_MINISTERE));
        celluleMinistere.addElement(new Paragraph(" ", FONT_MINISTERE));
        celluleMinistere.addElement(new Paragraph("COMMUNE DU GOLFE 1", FONT_COMMUNE));
        celluleMinistere.addElement(new Paragraph("----------", FONT_MINISTERE));
        celluleMinistere.addElement(new Paragraph("DIRECTION DES SYSTEMES D'INFORMATION", FONT_MINISTERE));
        enTete.addCell(celluleMinistere);

        // Colonne droite : Republique Togolaise
        PdfPCell celluleRepublique = new PdfPCell();
        celluleRepublique.setBorder(Rectangle.NO_BORDER);
        celluleRepublique.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph republique = new Paragraph("REPUBLIQUE TOGOLAISE", FONT_REPUBLIQUE);
        republique.setAlignment(Element.ALIGN_RIGHT);
        celluleRepublique.addElement(republique);
        Paragraph devise = new Paragraph("Travail - Liberte - Patrie", FONT_DEVISE);
        devise.setAlignment(Element.ALIGN_RIGHT);
        celluleRepublique.addElement(devise);
        enTete.addCell(celluleRepublique);

        document.add(enTete);

        LineSeparator separateur = new LineSeparator();
        separateur.setLineWidth(1f);
        document.add(new Chunk(separateur));

        Paragraph espace = new Paragraph(" ");
        espace.setSpacingAfter(10);
        document.add(espace);

        // Titre encadre du document (ex: "FICHE DETAILLEE EQUIPEMENT")
        PdfPTable cadreTitre = new PdfPTable(1);
        cadreTitre.setWidthPercentage(70);
        cadreTitre.setHorizontalAlignment(Element.ALIGN_CENTER);
        PdfPCell celluleTitre = new PdfPCell(new Phrase(titreDocument, FONT_TITRE));
        celluleTitre.setPadding(8);
        celluleTitre.setHorizontalAlignment(Element.ALIGN_CENTER);
        cadreTitre.addCell(celluleTitre);
        document.add(cadreTitre);

        Paragraph espace2 = new Paragraph(" ");
        espace2.setSpacingAfter(15);
        document.add(espace2);
    }

    public static void ajouterPiedDePage(Document document) throws DocumentException {
        Paragraph pied = new Paragraph(
                "36 Avenue Be-Pa de Souza, B.P. 62356  Tel. (228) 22 21 47 96 / 70 67 43 16  " +
                        "Web : www.golfel.mairie.tg  E-mail : communegolfeltogo@gmail.com",
                FONT_PIED);
        pied.setAlignment(Element.ALIGN_CENTER);
        pied.setSpacingBefore(20);
        document.add(pied);
    }
}