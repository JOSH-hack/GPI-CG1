/*
 *
 * Nom du fichier   : QrCodeUtils.java
 *
 * Objectif         : Génération de QR codes PNG réutilisable par tous les
 *                    générateurs de documents (DOCX, PDF...) de l'application,
 *                    pour éviter de dupliquer la logique ZXing dans chaque
 *                    service. Le contenu encodé pour un équipement suit un
 *                    format unique et partagé : "GPI-CG1|EQUIPEMENT|<code>|ID|<id>".
 *
 */

package com.golfe1.gpi.services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.EnumMap;
import java.util.Map;

public final class QrCodeUtils {

    private static final int TAILLE_PAR_DEFAUT_PX = 300;

    private QrCodeUtils() {
        // Classe utilitaire
    }

    /**
     * Construit le contenu standard des QR codes équipement GPI, identique
     * entre les exports DOCX et PDF, pour que le même code inventaire donne
     * toujours le même QR code quel que soit le format exporté.
     */
    public static String contenuEquipement(String codeInventaire, Long idEquipement) {
        String code = (codeInventaire == null || codeInventaire.isBlank())
                ? "N/A"
                : codeInventaire.trim();
        return "GPI-CG1|EQUIPEMENT|" + code + "|ID|" + idEquipement;
    }

    public static byte[] genererPng(String contenu) throws WriterException, IOException {
        return genererPng(contenu, TAILLE_PAR_DEFAUT_PX);
    }

    public static byte[] genererPng(String contenu, int taillePx) throws WriterException, IOException {

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