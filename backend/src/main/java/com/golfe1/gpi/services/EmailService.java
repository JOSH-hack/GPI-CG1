/*

Nom du fichier   : EmailService.java
Objectif         : Envoi des emails transactionnels au format HTML - code de vérification à l'inscription, mise en forme visuelle aux couleurs de la Commune du Golfe 1
Propriétaire     : Josué BEDEL
Date de création : 28/08/2026
Date de mise à jour : 29/08/2026
Objet de mise à jour : Passage du texte brut au HTML pour un rendu visuel plus parlant

*/

package com.golfe1.gpi.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void envoyerCodeVerification(String destinataire, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(destinataire);
            helper.setSubject("GPI - Vérification de votre adresse email");
            helper.setText(construireHtmlCodeVerification(code), true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email de vérification", e);
        }
    }

    private String construireHtmlCodeVerification(String code) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="margin:0; padding:0; background-color:#F4F6F5; font-family:Arial, Helvetica, sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
                    <tr>
                      <td align="center">
                        <table width="480" cellpadding="0" cellspacing="0"
                               style="background-color:#FFFFFF; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                          <tr>
                            <td style="background-color:#1B7A4D; padding:24px 32px;">
                              <span style="color:#FFFFFF; font-size:20px; font-weight:bold;">GPI - Commune du Golfe 1</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:32px;">
                              <p style="font-size:16px; color:#1E2A24; margin:0 0 16px 0;">Bonjour,</p>
                              <p style="font-size:15px; color:#5C6B64; margin:0 0 24px 0;">
                                Voici votre code de vérification pour finaliser la création de votre compte GPI :
                              </p>
                              <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td align="center" style="padding:16px 0;">
                                    <span style="display:inline-block; background-color:#F4F6F5; border:2px dashed #1B7A4D;
                                                 border-radius:10px; padding:16px 32px; font-size:32px; font-weight:bold;
                                                 letter-spacing:8px; color:#1B7A4D;">
                                      %s
                                    </span>
                                  </td>
                                </tr>
                              </table>
                              <p style="font-size:14px; color:#5C6B64; margin:24px 0 0 0;">
                                Ce code expire dans <strong>15 minutes</strong>. Si vous n'êtes pas à l'origine
                                de cette demande, vous pouvez ignorer cet email.
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="background-color:#F4F6F5; padding:16px 32px;">
                              <span style="font-size:12px; color:#5C6B64;">
                                Commune du Golfe 1 - Cellule Informatique
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """
                .formatted(code);
    }
}