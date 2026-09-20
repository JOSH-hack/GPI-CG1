/*

Nom du fichier   : DocumentPdfService.java
Objectif         : Generation de la Fiche detaillee equipement en PDF officiel
Date de mise à jour : 19/09/2026
Objet de mise à jour : genererFicheEquipementEditee() applique reellement les
                       surcharges de donneesEditees, avec QR code et section
                       Signatures, a la parite avec DocumentDocxService.

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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DocumentPdfService {

    private final EquipementService equipementService;
    private final PanneService panneService;
    private final HistoriqueMouvementService historiqueMouvementService;

    private static final Font FONT_LABEL = new Font(Font.HELVETICA, 9, Font.BOLD);
    private static final Font FONT_VALEUR = new Font(Font.HELVETICA, 9, Font.NORMAL);
    private static final Font FONT_SECTION = new Font(Font.HELVETICA, 11, Font.BOLD);
    private static final Font FONT_SIGNATURE_TITRE = new Font(Font.HELVETICA, 9, Font.BOLD);
    private static final Font FONT_SIGNATURE_VALEUR = new Font(Font.HELVETICA, 9, Font.NORMAL);
    private static final DateTimeFormatter FORMAT_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int TAILLE_QR_PDF_PX = 240;

    public DocumentPdfService(EquipementService equipementService,
            PanneService panneService,
            HistoriqueMouvementService historiqueMouvementService) {
        this.equipementService = equipementService;
        this.panneService = panneService;
        this.historiqueMouvementService = historiqueMouvementService;
    }

    public byte[] genererFicheEquipement(Long idEquipement) throws DocumentException, IOException {
        Equipement equipement = equipementService.getParId(idEquipement);
        return genererPDF(equipement, panneService.listerParEquipement(idEquipement),
                historiqueMouvementService.listerParEquipement(idEquipement), "FICHE DETAILLEE EQUIPEMENT");
    }

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

    private byte[] genererPDF(Equipement equipement, List<Panne> pannes, List<HistoriqueMouvement> mouvements,
            String titre) throws DocumentException, IOException {
        // ... inchangé (chemin non édité, toujours utilisé par le GET simple) ...
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

        String codeInventaire = champ(donneesEditees, "codeInventaire");
        String contenuQr = QrCodeUtils.contenuEquipement(codeInventaire, equipement.getIdEquipement());
        byte[] qrPng = QrCodeUtils.genererPng(contenuQr, TAILLE_QR_PDF_PX);
        Image qrImage = Image.getInstance(qrPng);
        qrImage.scaleToFit(70, 70);

        PdfPCell celluleQr = new PdfPCell(qrImage);
        celluleQr.setBorder(Rectangle.NO_BORDER);
        celluleQr.setHorizontalAlignment(Element.ALIGN_CENTER);
        celluleQr.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(celluleQr);

        return table;
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

    private String agentEditee(Map<String, Object> donneesEditees) {

        String nom = champ(donneesEditees, "agent.nom");
        String prenom = champ(donneesEditees, "agent.prenom");

        if ("-".equals(nom) && "-".equals(prenom)) {
            return "Non affecte";
        }

        return nom + " " + prenom;
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

    private String champ(Map<String, Object> donnees, String cle) {
        if (donnees == null) {
            return "-";
        }
        Object valeur = donnees.get(cle);
        if (valeur == null) {
            return "-";
        }
        String texte = String.valueOf(valeur).trim();
        return texte.isEmpty() ? "-" : texte;
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