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
 * Date de mise à jour : 19/09/2026
 * Objet de mise à jour : Ajout de surcharges acceptant une map de donnees
 *                        editees (Map<String,Object>), pour que l'en-tete et
 *                        le pied de page suivent les valeurs modifiees dans
 *                        EditorModal (frontend) - avec repli sur les valeurs
 *                        par defaut si la map est absente ou incomplete.
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
import java.util.Map;

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

        private static final Font FONT_MINISTERE = new Font(Font.HELVETICA, 7, Font.NORMAL);

        private static final Font FONT_COMMUNE = new Font(Font.HELVETICA, 8, Font.BOLD);

        private static final Font FONT_REPUBLIQUE = new Font(Font.HELVETICA, 11, Font.BOLD);

        private static final Font FONT_DEVISE = new Font(Font.HELVETICA, 9, Font.NORMAL);

        private static final Font FONT_TITRE = new Font(Font.HELVETICA, 13, Font.BOLD);

        private static final Font FONT_PIED = new Font(Font.HELVETICA, 7, Font.NORMAL, Color.DARK_GRAY);

        private static final Font FONT_PIED_MENTION = new Font(Font.HELVETICA, 7, Font.ITALIC, Color.DARK_GRAY);

        private static final String DEFAUT_MINISTERE = "MINISTERE DE L'ADMINISTRATION TERRITORIALE\nDE LA GOUVERNANCE ET DES AFFAIRES COUTUMIERES";
        private static final String DEFAUT_REGION = "REGION MARITIME";
        private static final String DEFAUT_PREFECTURE = "PREFECTURE DU GOLFE";
        private static final String DEFAUT_COMMUNE = "COMMUNE DU GOLFE 1";
        private static final String DEFAUT_DIRECTION = "DIRECTION DE LA COMMUNICATION";
        private static final String DEFAUT_CELLULE = "CELLULE INFORMATIQUE";
        private static final String DEFAUT_REPUBLIQUE = "REPUBLIQUE TOGOLAISE";
        private static final String DEFAUT_DEVISE = "Travail - Liberte - Patrie";

        private static final String DEFAUT_ADRESSE = "36 Avenue Be-Pa de Souza. B.P. 62356  Tél. (228) 22 21 47 16 / 70 67 43 16";
        private static final String DEFAUT_SITE_WEB = "www.golfe1.mairie.tg";
        private static final String DEFAUT_EMAIL = "commulegofe1togo@gmail.com";

        private static String champOuDefaut(Map<String, Object> donnees, String cle, String valeurParDefaut) {
                if (donnees == null)
                        return valeurParDefaut;
                Object valeur = donnees.get(cle);
                if (valeur == null)
                        return valeurParDefaut;
                String texte = String.valueOf(valeur).trim();
                return texte.isEmpty() ? valeurParDefaut : texte;
        }

        public static void ajouterEnTete(Document document, String titreDocument)
                        throws DocumentException, IOException {
                ajouterEnTete(document, titreDocument, null);
        }

        public static void ajouterEnTete(Document document, String titreDocument, Map<String, Object> donneesEditees)
                        throws DocumentException, IOException {

                PdfPTable enTete = new PdfPTable(new float[] { 1, 3, 2 });
                enTete.setWidthPercentage(100);

                PdfPCell celluleBlason = new PdfPCell();
                celluleBlason.setBorder(Rectangle.NO_BORDER);
                celluleBlason.setHorizontalAlignment(Element.ALIGN_CENTER);
                celluleBlason.setVerticalAlignment(Element.ALIGN_MIDDLE);

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
                celluleMinistere.setVerticalAlignment(Element.ALIGN_MIDDLE);

                celluleMinistere.addElement(new Paragraph(
                                champOuDefaut(donneesEditees, "entete.ministere", DEFAUT_MINISTERE), FONT_MINISTERE));
                celluleMinistere.addElement(new Paragraph("----------", FONT_MINISTERE));
                celluleMinistere.addElement(new Paragraph(champOuDefaut(donneesEditees, "entete.region", DEFAUT_REGION),
                                FONT_MINISTERE));
                celluleMinistere.addElement(new Paragraph("----------", FONT_MINISTERE));
                celluleMinistere.addElement(new Paragraph(
                                champOuDefaut(donneesEditees, "entete.prefecture", DEFAUT_PREFECTURE), FONT_MINISTERE));
                celluleMinistere.addElement(new Paragraph(" ", FONT_MINISTERE));
                celluleMinistere.addElement(new Paragraph(
                                champOuDefaut(donneesEditees, "entete.commune", DEFAUT_COMMUNE), FONT_COMMUNE));
                celluleMinistere.addElement(new Paragraph("----------", FONT_MINISTERE));
                celluleMinistere.addElement(new Paragraph(
                                champOuDefaut(donneesEditees, "entete.direction", DEFAUT_DIRECTION), FONT_MINISTERE));
                celluleMinistere.addElement(new Paragraph(
                                champOuDefaut(donneesEditees, "entete.cellule", DEFAUT_CELLULE), FONT_MINISTERE));

                enTete.addCell(celluleMinistere);

                PdfPCell celluleRepublique = new PdfPCell();
                celluleRepublique.setBorder(Rectangle.NO_BORDER);
                celluleRepublique.setHorizontalAlignment(Element.ALIGN_RIGHT);
                celluleRepublique.setVerticalAlignment(Element.ALIGN_MIDDLE);

                Paragraph republique = new Paragraph(
                                champOuDefaut(donneesEditees, "entete.republique", DEFAUT_REPUBLIQUE), FONT_REPUBLIQUE);
                republique.setAlignment(Element.ALIGN_RIGHT);
                celluleRepublique.addElement(republique);

                Paragraph devise = new Paragraph(champOuDefaut(donneesEditees, "entete.devise", DEFAUT_DEVISE),
                                FONT_DEVISE);
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

                PdfPTable cadreTitre = new PdfPTable(1);
                cadreTitre.setWidthPercentage(70);
                cadreTitre.setHorizontalAlignment(Element.ALIGN_CENTER);

                PdfPCell celluleTitre = new PdfPCell(new Phrase(titreDocument, FONT_TITRE));
                celluleTitre.setPadding(8);
                celluleTitre.setHorizontalAlignment(Element.ALIGN_CENTER);
                celluleTitre.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cadreTitre.addCell(celluleTitre);

                document.add(cadreTitre);

                Paragraph espace2 = new Paragraph(" ");
                espace2.setSpacingAfter(15);
                document.add(espace2);
        }

        public static void ajouterPiedDePage(Document document) throws DocumentException {
                ajouterPiedDePage(document, null);
        }

        public static void ajouterPiedDePage(Document document, Map<String, Object> donneesEditees)
                        throws DocumentException {

                String mention = champOuDefaut(donneesEditees, "pied.mention", null);

                if (mention != null) {
                        Paragraph paragrapheMention = new Paragraph(mention, FONT_PIED_MENTION);
                        paragrapheMention.setAlignment(Element.ALIGN_CENTER);
                        paragrapheMention.setSpacingBefore(20);
                        paragrapheMention.setSpacingAfter(4);
                        document.add(paragrapheMention);
                }

                Paragraph pied = new Paragraph(
                                champOuDefaut(donneesEditees, "pied.adresse", DEFAUT_ADRESSE) + "  " +
                                                "Web : "
                                                + champOuDefaut(donneesEditees, "pied.siteWeb", DEFAUT_SITE_WEB) + "  "
                                                +
                                                "E-mail : " + champOuDefaut(donneesEditees, "pied.email", DEFAUT_EMAIL),
                                FONT_PIED);

                pied.setAlignment(Element.ALIGN_CENTER);

                if (mention == null) {
                        pied.setSpacingBefore(20);
                }

                document.add(pied);
        }
}