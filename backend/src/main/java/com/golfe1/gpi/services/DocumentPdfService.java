/*

Nom du fichier   : DocumentPdfService.java
Objectif         : Generation de la Fiche detaillee equipement en PDF officiel
                    (en-tete Mairie + infos generales/specifiques + historiques
                    pannes/mouvements) - premiere utilisation du gabarit
                    EnTeteMairiePdf, destine a etre reutilise pour d'autres
                    documents (rapports d'intervention, etc.)
Propriétaire     : Josué BEDEL
Date de création : 10/09/2026
Date de mise à jour : 19/09/2026
Objet de mise à jour : genererFicheEquipementEditee() applique reellement les
                       surcharges de donneesEditees, avec QR code (delegue a
                       QrCodeUtils, lien vers la fiche) et section Signatures.
                       Ajout de genererPdfDepuisImages() et
                       genererAutocollantIdentification().

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.*;
import com.golfe1.gpi.pdf.EnTeteMairiePdf;
import com.google.zxing.WriterException;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DocumentPdfService {

    private final EquipementService equipementService;
    private final PanneService panneService;
    private final HistoriqueMouvementService historiqueMouvementService;
    private final QrCodeUtils qrCodeUtils;

    private static final Font FONT_LABEL = new Font(Font.HELVETICA, 9, Font.BOLD);
    private static final Font FONT_VALEUR = new Font(Font.HELVETICA, 9, Font.NORMAL);
    private static final Font FONT_SECTION = new Font(Font.HELVETICA, 11, Font.BOLD);
    private static final Font FONT_SIGNATURE_TITRE = new Font(Font.HELVETICA, 9, Font.BOLD);
    private static final Font FONT_SIGNATURE_VALEUR = new Font(Font.HELVETICA, 9, Font.NORMAL);
    private static final DateTimeFormatter FORMAT_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int TAILLE_QR_PDF_PX = 240;

    // Constantes de l'autocollant d'identification (voir genererAutocollantIdentification)
    private static final float AUTOCOLLANT_LARGEUR_PT = 283f; // ~100mm
    private static final float AUTOCOLLANT_HAUTEUR_PT = 170f; // ~60mm
    private static final int TAILLE_QR_AUTOCOLLANT_PX = 200;
    private static final Font FONT_AUTOCOLLANT_ENTETE = new Font(Font.HELVETICA, 6, Font.ITALIC, Color.GRAY);
    private static final Font FONT_AUTOCOLLANT_NOM = new Font(Font.HELVETICA, 12, Font.BOLD);
    private static final Font FONT_AUTOCOLLANT_LABEL = new Font(Font.HELVETICA, 7, Font.BOLD);
    private static final Font FONT_AUTOCOLLANT_VALEUR = new Font(Font.HELVETICA, 7, Font.NORMAL);

    public DocumentPdfService(EquipementService equipementService,
            PanneService panneService,
            HistoriqueMouvementService historiqueMouvementService,
            QrCodeUtils qrCodeUtils) {
        this.equipementService = equipementService;
        this.panneService = panneService;
        this.historiqueMouvementService = historiqueMouvementService;
        this.qrCodeUtils = qrCodeUtils;
    }

    public byte[] genererFicheEquipement(Long idEquipement) throws DocumentException, IOException {
        Equipement equipement = equipementService.getParId(idEquipement);
        return genererPDF(equipement, panneService.listerParEquipement(idEquipement),
                          historiqueMouvementService.listerParEquipement(idEquipement), "FICHE DETAILLEE EQUIPEMENT");
    }

    // Genere la fiche a partir de ce que l'utilisateur a reellement edite
    // dans EditorModal (frontend), sur le meme principe que
    // DocumentDocxService.genererFicheEquipementEditee : seuls l'historique
    // des pannes/mouvements restent pilotes par la BDD (sections en lecture
    // seule cote frontend, donc absentes de donneesEditees).
    public byte[] genererFicheEquipementEditee(Long idEquipement, Map<String, Object> donneesEditees)
            throws DocumentException, IOException, WriterException {

        Equipement equipement = equipementService.getParId(idEquipement);

        if (equipement == null) {
            throw new IllegalArgumentException("Équipement introuvable avec l'identifiant : " + idEquipement);
        }

        if (donneesEditees == null) {
            donneesEditees = new HashMap<>();
        }

        return genererPDFEdite(equipement,
                panneService.listerParEquipement(idEquipement),
                historiqueMouvementService.listerParEquipement(idEquipement),
                donneesEditees);
    }

    // Genere un PDF ou chaque page est integralement une image PNG fournie
    // par le frontend (capture du rendu reel de EditorModal - voir
    // exportCapture.js) - garantit une fidelite visuelle totale, sans
    // reconstruire le contenu champ par champ comme genererPDFEdite().
    public byte[] genererPdfDepuisImages(List<String> imagesBase64) throws DocumentException, IOException {

        if (imagesBase64 == null || imagesBase64.isEmpty()) {
            throw new IllegalArgumentException("Aucune image fournie pour générer le PDF.");
        }

        Document document = new Document(PageSize.A4, 0, 0, 0, 0);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        boolean premierePage = true;

        for (String imageBase64 : imagesBase64) {
            if (!premierePage) {
                document.newPage();
            }
            premierePage = false;

            byte[] octetsImage = decoderImageBase64(imageBase64);
            Image image = Image.getInstance(octetsImage);

            image.scaleToFit(PageSize.A4.getWidth(), PageSize.A4.getHeight());
            image.setAbsolutePosition(
                    (PageSize.A4.getWidth() - image.getScaledWidth()) / 2,
                    (PageSize.A4.getHeight() - image.getScaledHeight()) / 2);

            document.add(image);
        }

        document.close();
        return out.toByteArray();
    }

    // Accepte aussi bien "data:image/png;base64,XXXX" que "XXXX" seul,
    // pour rester tolerant sur ce que le frontend envoie exactement.
    private byte[] decoderImageBase64(String valeur) {
        String contenu = valeur;
        int indexVirgule = valeur.indexOf(',');
        if (valeur.startsWith("data:") && indexVirgule >= 0) {
            contenu = valeur.substring(indexVirgule + 1);
        }
        return Base64.getDecoder().decode(contenu);
    }

    private byte[] genererPDF(Equipement equipement, List<Panne> pannes, List<HistoriqueMouvement> mouvements, String titre) throws DocumentException, IOException {
        Document document = new Document(PageSize.A4, 36, 36, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        EnTeteMairiePdf.ajouterEnTete(document, titre);

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

    // Pendant du genererPDF() ci-dessus, mais entierement pilote par
    // donneesEditees (en-tete, identification+QR, infos generales/
    // specifiques, signatures, pied de page). Les historiques restent
    // ceux de la BDD, comme convenu.
    private byte[] genererPDFEdite(Equipement equipement, List<Panne> pannes, List<HistoriqueMouvement> mouvements,
            Map<String, Object> donneesEditees) throws DocumentException, IOException, WriterException {

        Document document = new Document(PageSize.A4, 36, 36, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        EnTeteMairiePdf.ajouterEnTete(document, "FICHE DETAILLEE D'EQUIPEMENT", donneesEditees);

        document.add(section("Identification"));
        document.add(tableIdentificationEditee(equipement, donneesEditees));

        document.add(new Paragraph(" "));
        document.add(section("Informations Generales"));
        PdfPTable general = nouvelleTableInfo();
        ligne(general, "Categorie", champ(donneesEditees, "categorie.libelle"));
        ligne(general, "Etat", champ(donneesEditees, "statut"));
        ligne(general, "Observation", champ(donneesEditees, "description"));
        ligne(general, "Localisation", localisationEditee(donneesEditees));
        ligne(general, "Date d'acquisition", champ(donneesEditees, "dateAcquisition"));
        ligne(general, "Fin de garantie", champ(donneesEditees, "finGarantie"));
        ligne(general, "Cout d'acquisition", champ(donneesEditees, "coutAcquisition"));
        ligne(general, "Agent affecte", agentEditee(donneesEditees));
        document.add(general);

        document.add(new Paragraph(" "));
        document.add(section("Informations Specifiques"));
        PdfPTable specifique = nouvelleTableInfo();
        ajouterInfosSpecifiquesEditees(specifique, donneesEditees);
        document.add(specifique);

        document.add(new Paragraph(" "));
        document.add(section("Historique des Pannes"));
        document.add(tableHistoriquePannes(pannes));

        document.add(new Paragraph(" "));
        document.add(section("Historique des Mouvements"));
        document.add(tableHistoriqueMouvements(mouvements));

        document.add(new Paragraph(" "));
        document.add(section("Signatures"));
        document.add(tableSignatures(donneesEditees));

        EnTeteMairiePdf.ajouterPiedDePage(document, donneesEditees);

        document.close();
        return out.toByteArray();
    }

    private PdfPTable tableIdentificationEditee(Equipement equipement, Map<String, Object> donneesEditees)
            throws DocumentException, IOException, WriterException {

        PdfPTable table = new PdfPTable(new float[] { 3, 1 });
        table.setWidthPercentage(100);

        PdfPTable infos = nouvelleTableInfo();
        ligne(infos, "Code inventaire", champ(donneesEditees, "codeInventaire"));
        ligne(infos, "Designation", champ(donneesEditees, "nom"));
        ligne(infos, "Marque / Modele", champ(donneesEditees, "marque") + " / " + champ(donneesEditees, "modele"));
        ligne(infos, "Numero de serie", champ(donneesEditees, "numeroSerie"));

        PdfPCell celluleInfos = new PdfPCell();
        celluleInfos.setBorder(Rectangle.NO_BORDER);
        celluleInfos.setPadding(0);
        celluleInfos.addElement(infos);
        table.addCell(celluleInfos);

        String contenuQr = qrCodeUtils.lienFicheEquipement(equipement.getIdEquipement());
        byte[] qrPng = qrCodeUtils.genererPng(contenuQr, TAILLE_QR_PDF_PX);
        Image qrImage = Image.getInstance(qrPng);
        qrImage.scaleToFit(70, 70);

        PdfPCell celluleQr = new PdfPCell(qrImage);
        celluleQr.setBorder(Rectangle.NO_BORDER);
        celluleQr.setHorizontalAlignment(Element.ALIGN_CENTER);
        celluleQr.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(celluleQr);

        return table;
    }

    // Genere un petit document PDF autonome (~100mm x 60mm, format
    // autocollant) a coller physiquement sur l'equipement : nom complet,
    // categorie, localisation, agent affecte a gauche, QR code (lien vers
    // la fiche detaillee) a droite. Contrairement a genererPDFEdite(), ce
    // document n'a pas de "version editee" - il reflete toujours les
    // donnees actuelles de la BDD, comme un autocollant physique doit le faire.
    public byte[] genererAutocollantIdentification(Long idEquipement)
            throws DocumentException, IOException, WriterException {

        Equipement equipement = equipementService.getParId(idEquipement);

        if (equipement == null) {
            throw new IllegalArgumentException("Équipement introuvable avec l'identifiant : " + idEquipement);
        }

        Document document = new Document(
                new Rectangle(AUTOCOLLANT_LARGEUR_PT, AUTOCOLLANT_HAUTEUR_PT), 8, 8, 8, 8);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        PdfPTable cadre = new PdfPTable(1);
        cadre.setWidthPercentage(100);

        PdfPCell celluleCadre = new PdfPCell();
        celluleCadre.setBorder(Rectangle.BOX);
        celluleCadre.setBorderWidth(0.75f);
        celluleCadre.setBorderColor(Color.DARK_GRAY);
        celluleCadre.setPadding(6);

        PdfPTable contenu = new PdfPTable(new float[] { 2.4f, 1f });
        contenu.setWidthPercentage(100);

        PdfPCell celluleTexte = new PdfPCell();
        celluleTexte.setBorder(Rectangle.NO_BORDER);
        celluleTexte.setVerticalAlignment(Element.ALIGN_MIDDLE);
        celluleTexte.setPadding(0);

        Paragraph entete = new Paragraph("GPI - COMMUNE DU GOLFE 1", FONT_AUTOCOLLANT_ENTETE);
        entete.setSpacingAfter(3);
        celluleTexte.addElement(entete);

        String nomComplet = java.util.stream.Stream
                .of(equipement.getMarque(), equipement.getModele(), equipement.getNom())
                .filter(v -> v != null && !v.isBlank())
                .collect(java.util.stream.Collectors.joining(" "));
        Paragraph nom = new Paragraph(nomComplet.isBlank() ? "-" : nomComplet, FONT_AUTOCOLLANT_NOM);
        nom.setSpacingAfter(4);
        celluleTexte.addElement(nom);

        celluleTexte.addElement(ligneAutocollant("Categorie",
                equipement.getCategorie() != null ? equipement.getCategorie().getLibelle() : "-"));
        celluleTexte.addElement(ligneAutocollant("Localisation", libelleLocalisation(equipement.getLocalisation())));
        celluleTexte.addElement(ligneAutocollant("Agent", libelleAgent(equipement.getAgent())));

        contenu.addCell(celluleTexte);

        String contenuQr = qrCodeUtils.lienFicheEquipement(equipement.getIdEquipement());
        byte[] qrPng = qrCodeUtils.genererPng(contenuQr, TAILLE_QR_AUTOCOLLANT_PX);
        Image qrImage = Image.getInstance(qrPng);
        qrImage.scaleToFit(90, 90);

        PdfPCell celluleQrAutocollant = new PdfPCell(qrImage);
        celluleQrAutocollant.setBorder(Rectangle.NO_BORDER);
        celluleQrAutocollant.setHorizontalAlignment(Element.ALIGN_CENTER);
        celluleQrAutocollant.setVerticalAlignment(Element.ALIGN_MIDDLE);
        contenu.addCell(celluleQrAutocollant);

        celluleCadre.addElement(contenu);
        cadre.addCell(celluleCadre);

        document.add(cadre);
        document.close();
        return out.toByteArray();
    }

    private Paragraph ligneAutocollant(String label, String valeur) {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " : ", FONT_AUTOCOLLANT_LABEL));
        p.add(new Chunk(vide(valeur), FONT_AUTOCOLLANT_VALEUR));
        p.setSpacingAfter(1.5f);
        return p;
    }

    private void ajouterInfosSpecifiquesEditees(PdfPTable table, Map<String, Object> donneesEditees) {

        String typeCategorie = champ(donneesEditees, "categorie.type");

        if ("HARDWARE".equalsIgnoreCase(typeCategorie)) {
            ligne(table, "Processeur", champ(donneesEditees, "processeur"));
            ligne(table, "RAM", champ(donneesEditees, "ram"));
            ligne(table, "Capacite stockage", champ(donneesEditees, "capaciteDisque"));
            ligne(table, "Adresse IP", champ(donneesEditees, "adresseIp"));
            ligne(table, "Adresse MAC", champ(donneesEditees, "adresseMac"));
            ligne(table, "Systeme d'exploitation", champ(donneesEditees, "systemeExploitation"));
        } else if ("SOFTWARE".equalsIgnoreCase(typeCategorie)) {
            ligne(table, "Version", champ(donneesEditees, "version"));
            ligne(table, "Nombre de licences", champ(donneesEditees, "nombreLicences"));
            ligne(table, "Cle de licence", champ(donneesEditees, "cleLicence"));
            ligne(table, "Debut de licence", champ(donneesEditees, "dateDebutLicence"));
            ligne(table, "Expiration licence", champ(donneesEditees, "dateExpirationLicence"));
        } else if ("RESEAU".equalsIgnoreCase(typeCategorie)) {
            ligne(table, "Type d'adresse", champ(donneesEditees, "typeAdresse"));
            ligne(table, "Adresse IP", champ(donneesEditees, "adresseIp"));
            ligne(table, "Adresse MAC", champ(donneesEditees, "adresseMac"));
            ligne(table, "Passerelle", champ(donneesEditees, "passerelle"));
            ligne(table, "Masque", champ(donneesEditees, "masqueSousReseau"));
            ligne(table, "Nom d'hote", champ(donneesEditees, "nomHote"));
        } else {
            ligne(table, "Type", champ(donneesEditees, "categorie.libelle"));
        }
    }

    private PdfPTable tableSignatures(Map<String, Object> donneesEditees) {

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);

        String[] titreKeys = { "signature.titre1", "signature.titre2", "signature.titre3" };
        String[] valeurKeys = { "signature.valeur1", "signature.valeur2", "signature.valeur3" };

        for (int i = 0; i < 3; i++) {
            Paragraph contenu = new Paragraph();
            contenu.setAlignment(Element.ALIGN_CENTER);
            contenu.add(new Chunk(champ(donneesEditees, titreKeys[i]), FONT_SIGNATURE_TITRE));
            contenu.add(Chunk.NEWLINE);

            Chunk valeur = new Chunk(champ(donneesEditees, valeurKeys[i]), FONT_SIGNATURE_VALEUR);
            valeur.setUnderline(0.5f, -2f);
            contenu.add(valeur);

            PdfPCell cell = new PdfPCell();
            cell.setBorder(Rectangle.NO_BORDER);
            cell.setPadding(6);
            cell.addElement(contenu);
            table.addCell(cell);
        }

        return table;
    }

    private String localisationEditee(Map<String, Object> donneesEditees) {

        StringBuilder sb = new StringBuilder();
        sb.append(champ(donneesEditees, "localisation.annexe"))
                .append(" - ")
                .append(champ(donneesEditees, "localisation.service"));

        String bureau = champ(donneesEditees, "localisation.bureau");
        if (!"-".equals(bureau)) {
            sb.append(" / Bureau ").append(bureau);
        }

        String poste = champ(donneesEditees, "localisation.poste");
        if (!"-".equals(poste)) {
            sb.append(" / Poste ").append(poste);
        }

        return sb.toString();
    }

    private String agentEditee(Map<String, Object>