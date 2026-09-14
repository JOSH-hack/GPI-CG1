/*
 *
 * Nom du fichier   : EnTeteMairiePdf.java
 *
 * Objectif         : En-tete et pied de page officiels (blason, Republique
 *                    Togolaise, coordonnees) reutilisables pour tout document
 *                    PDF genere par l'application - fidele au gabarit des
 *                    documents officiels de la Commune du Golfe 1
 *
 * Propriétaire     : Josué BEDEL
 * Date de création : 10/09/2026
 *
 */

package com.golfe1.gpi.pdf;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.draw.LineSeparator;

import java.awt.Color;
import java.io.IOException;
import java.io.InputStream;

/**
 * Gestion de l'en-tête et du pied de page officiels
 * des documents PDF générés par l'application GPI-CG1.
 *
 * Cette classe est volontairement utilitaire et ne doit pas
 * être instanciée.
 */
public final class EnTeteMairiePdf {

    private EnTeteMairiePdf() {
        // Classe utilitaire
    }

    /*
     
     * POLICES
     
     */

    private static final Font FONT_MINISTERE =
            new Font(Font.HELVETICA, 7, Font.NORMAL);

    private static final Font FONT_COMMUNE =
            new Font(Font.HELVETICA, 8, Font.BOLD);

    private static final Font FONT_REPUBLIQUE =
            new Font(Font.HELVETICA, 11, Font.BOLD);

    private static final Font FONT_DEVISE =
            new Font(Font.HELVETICA, 9, Font.NORMAL);

    private static final Font FONT_TITRE =
            new Font(Font.HELVETICA, 13, Font.BOLD);

    private static final Font FONT_PIED =
            new Font(Font.HELVETICA, 7, Font.NORMAL, Color.DARK_GRAY);


    /*
     
     * EN-TÊTE OFFICIEL
     
     */

    /**
     * Ajoute l'en-tête officiel au document PDF.
     *
     * @param document     document PDF OpenPDF
     * @param titreDocument titre du document affiché dans le cadre central
     */
    public static void ajouterEnTete(
            Document document,
            String titreDocument
    ) throws DocumentException, IOException {

        /*
         
         * Tableau principal de l'en-tête
         *
         * 1 colonne : blason
         * 2 colonne : informations administratives
         * 3 colonne : République Togolaise
         
         */
        PdfPTable enTete = new PdfPTable(
                new float[]{1, 3, 2}
        );

        enTete.setWidthPercentage(100);


        /*
         * 
         * COLONNE GAUCHE : BLASON
         * 
         */

        PdfPCell celluleBlason = new PdfPCell();

        celluleBlason.setBorder(Rectangle.NO_BORDER);
        celluleBlason.setHorizontalAlignment(Element.ALIGN_CENTER);
        celluleBlason.setVerticalAlignment(Element.ALIGN_MIDDLE);

        try (
                InputStream in =
                        EnTeteMairiePdf.class.getResourceAsStream(
                                "/static/blason-mairie.png"
                        )
        ) {

            if (in != null) {

                Image blason = Image.getInstance(
                        in.readAllBytes()
                );

                blason.scaleToFit(55, 55);

                celluleBlason.addElement(blason);
            }
        }

        enTete.addCell(celluleBlason);


        /*
         * 
         * COLONNE CENTRALE : INFORMATIONS ADMINISTRATIVES
         * 
         */

        PdfPCell celluleMinistere = new PdfPCell();

        celluleMinistere.setBorder(Rectangle.NO_BORDER);
        celluleMinistere.setVerticalAlignment(Element.ALIGN_MIDDLE);

        celluleMinistere.addElement(
                new Paragraph(
                        "MINISTERE DE L'ADMINISTRATION TERRITORIALE\n" +
                        "DE LA GOUVERNANCE ET DES AFFAIRES COUTUMIERES",
                        FONT_MINISTERE
                )
        );

        celluleMinistere.addElement(
                new Paragraph(
                        "----------",
                        FONT_MINISTERE
                )
        );

        celluleMinistere.addElement(
                new Paragraph(
                        "REGION MARITIME",
                        FONT_MINISTERE
                )
        );

        celluleMinistere.addElement(
                new Paragraph(
                        "----------",
                        FONT_MINISTERE
                )
        );

        celluleMinistere.addElement(
                new Paragraph(
                        "PREFECTURE DU GOLFE",
                        FONT_MINISTERE
                )
        );

        celluleMinistere.addElement(
                new Paragraph(
                        " ",
                        FONT_MINISTERE
                )
        );

        celluleMinistere.addElement(
                new Paragraph(
                        "COMMUNE DU GOLFE 1",
                        FONT_COMMUNE
                )
        );

        celluleMinistere.addElement(
                new Paragraph(
                        "----------",
                        FONT_MINISTERE
                )
        );

        celluleMinistere.addElement(
                new Paragraph(
                        "DIRECTION DE LA COMMUNICATION",
                        FONT_MINISTERE
                )
        );

        celluleMinistere.addElement(
                new Paragraph(
                        "CELLULE INFORMATIQUE",
                        FONT_MINISTERE
                )
        );

        enTete.addCell(celluleMinistere);


        /*
         * 
         * COLONNE DROITE : REPUBLIQUE TOGOLAISE
         * 
         */

        PdfPCell celluleRepublique = new PdfPCell();

        celluleRepublique.setBorder(Rectangle.NO_BORDER);
        celluleRepublique.setHorizontalAlignment(Element.ALIGN_RIGHT);
        celluleRepublique.setVerticalAlignment(Element.ALIGN_MIDDLE);

        Paragraph republique =
                new Paragraph(
                        "REPUBLIQUE TOGOLAISE",
                        FONT_REPUBLIQUE
                );

        republique.setAlignment(Element.ALIGN_RIGHT);

        celluleRepublique.addElement(republique);


        Paragraph devise =
                new Paragraph(
                        "Travail - Liberte - Patrie",
                        FONT_DEVISE
                );

        devise.setAlignment(Element.ALIGN_RIGHT);

        celluleRepublique.addElement(devise);

        enTete.addCell(celluleRepublique);


        /*
         * Ajout de l'en-tête au document
         */
        document.add(enTete);


        /*
         * 
         * SÉPARATEUR HORIZONTAL
         * 
         */

        LineSeparator separateur = new LineSeparator();

        separateur.setLineWidth(1f);

        document.add(
                new Chunk(separateur)
        );


        /*
         * 
         * ESPACEMENT AVANT LE TITRE
         * 
         */

        Paragraph espace = new Paragraph(" ");

        espace.setSpacingAfter(10);

        document.add(espace);


        /*
         * 
         * TITRE DU DOCUMENT
         * 
         */

        PdfPTable cadreTitre =
                new PdfPTable(1);

        cadreTitre.setWidthPercentage(70);

        cadreTitre.setHorizontalAlignment(
                Element.ALIGN_CENTER
        );


        PdfPCell celluleTitre =
                new PdfPCell(
                        new Phrase(
                                titreDocument,
                                FONT_TITRE
                        )
                );

        celluleTitre.setPadding(8);

        celluleTitre.setHorizontalAlignment(
                Element.ALIGN_CENTER
        );

        celluleTitre.setVerticalAlignment(
                Element.ALIGN_MIDDLE
        );

        cadreTitre.addCell(celluleTitre);

        document.add(cadreTitre);


        /*
         * 
         * ESPACEMENT APRÈS LE TITRE
         * 
         */

        Paragraph espace2 = new Paragraph(" ");

        espace2.setSpacingAfter(15);

        document.add(espace2);
    }


    /*
     
     * PIED DE PAGE
     
     */

    /**
     * Ajoute les coordonnées officielles de la Commune
     * en bas du document PDF.
     *
     * @param document document PDF OpenPDF
     */
    public static void ajouterPiedDePage(
            Document document
    ) throws DocumentException {

        Paragraph pied =
                new Paragraph(
                        "36 Avenue Be-Pa de Souza. B.P. 62356  " +
                        "Tél. (228) 22 21 47 16 / 70 67 43 16  " +
                        "Web : www.golfe1.mairie.tg  " +
                        "E-mail : commulegofe1togo@gmail.com",
                        FONT_PIED
                );

        pied.setAlignment(
                Element.ALIGN_CENTER
        );

        pied.setSpacingBefore(20);

        document.add(pied);
    }
}

