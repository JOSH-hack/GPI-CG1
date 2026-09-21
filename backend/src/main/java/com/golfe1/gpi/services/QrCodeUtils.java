/*
 *
 * Nom du fichier   : QrCodeUtils.java
 *
 * Objectif         : Génération de QR codes PNG réutilisable par tous les
 *                    générateurs de documents (DOCX, PDF, autocollant...)
 *                    de l'application. Le contenu encodé est désormais le
 *                    lien vers la fiche détaillée de l'équipement dans
 *                    l'application (scanner le QR ouvre cette page).
 *
 * Propriétaire     : Josué BEDEL
 * Date de création : 19/09/2026
 * Date de mise à jour : 19/09/2026
 * Objet de mise à jour : Conversion en bean Spring (@Component) pour
 *                        pouvoir injecter app.frontend-url ; le contenu
 *                        encodé passe du format texte "GPI-CG1|EQUIPEMENT|..."
 *                        a un lien "<frontend-url>/parc/equipements/<id>".
 *
 */

package com.golfe1.gpi.services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.EnumMap;
import java.util.Map;

@Component
public class QrCodeUtils {

    private static final int TAILLE_PAR_DEFAUT_PX = 300;

    // URL de base du frontend (ex: https://gpi.golfe1.mairie.tg), configuree
    // via app.frontend-url (application.properties / variable d'env
    // FRONTEND_URL) - utilisee pour construire le lien encode dans chaque
    // QR code equipement.
    @Value("${app.frontend-url}")
    private String frontendUrl;

    // Construit le lien vers la fiche detaillee de l'equipement dans
    // l'application (ex: "https://.../parc/equipements/42"). Scanner ce
    // QR code ouvre directement cette page, d'ou l'equipement peut etre
    // exporte (bouton "Exporter le document").
    public String lienFicheEquipement(Long idEquipement) {
        String base = (frontendUrl == null) ? "" : frontendUrl.replaceAll("/+$", "");
        return base + "/parc/equipements/" + idEquipement;
    }

    public byte[] genererPng(String contenu) throws WriterException, IOException {
        return genererPng(contenu, TAILLE_PAR_DEFAUT_PX);
    }

    public byte[] genererPng(String contenu, int taillePx) throws WriterException, IOException {

        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(EncodeHintType.MARGIN, 1);

        BitMatrix matrix = new MultiFormatWriter().encode(
                contenu, BarcodeFormat.QR_CODE, taillePx, taillePx, hints);

        BufferedImage image = new BufferedImage(
                matrix.getWidth(), matrix.getHeight(), BufferedImage.TYPE_INT_RGB);

        for (int x = 0; x < matrix.getWidth(); x++) {
            for (int y = 0; y < matrix.getHeight(); y++) {
                image.setRGB(x, y, matrix.get(x, y) ? 0xFF000000 : 0xFFFFFFFF);
            }
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", outputStream);
        return outputStream.toByteArray();
    }
}