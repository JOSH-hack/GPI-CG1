/*
 *
 * Nom du fichier   : liens.js
 *
 * Objectif         : Construction des liens internes reutilises a
 *                    plusieurs endroits (ex: contenu des QR codes
 *                    equipement, qui doivent tous pointer vers la meme
 *                    URL que celle construite cote backend -
 *                    voir QrCodeUtils.lienFicheEquipement en Java).
 *
 * Propriétaire     : Josué BEDEL
 * Date de création : 19/09/2026
 *
 */

// Construit le lien vers la fiche detaillee d'un equipement dans
// l'application (ex: "https://mondomaine/parc/equipements/42").
// Scanner le QR code de cet equipement ouvre cette page.
export function construireLienFicheEquipement(idEquipement) {
    return `${window.location.origin}/parc/equipements/${idEquipement}`
}