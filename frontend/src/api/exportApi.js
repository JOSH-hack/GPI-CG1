/*
 *
 * Nom du fichier   : exportApi.js
 *
 * Objectif         : Appels API du module Export - statistiques
 *                    et documents equipements.
 *
 * Propriétaire     : Josué BEDEL
 *
 * Date de création : 03/09/2026
 * Date de mise à jour : 19/09/2026
 * Objet de mise à jour : Ajout de genererDocumentEditeImage() - l'editeur
 *                        de fiche equipement n'exporte plus qu'en PDF, a
 *                        partir d'images capturees du rendu reel (plus
 *                        fidele qu'une reconstruction champ par champ).
 *
 */

import axiosClient from './axiosClient'

export const exportApi = {

    exporterExcel: () =>
        axiosClient.get(
            '/exports/statistiques/excel',
            {
                responseType: 'blob'
            }
        ),

    exporterPdf: () =>
        axiosClient.get(
            '/exports/statistiques/pdf',
            {
                responseType: 'blob'
            }
        ),

    telechargerFicheEquipementPdf: (idEquipement) =>
        axiosClient.get(
            `/documents/equipement/${idEquipement}/fiche-pdf`,
            {
                responseType: 'blob'
            }
        ),

    telechargerFicheEquipementDocx: (idEquipement) =>
        axiosClient.get(
            `/documents/equipement/${idEquipement}/fiche-docx`,
            {
                responseType: 'blob'
            }
        ),

    // Genere le document (DOCX ou PDF) a partir de ce que l'utilisateur a
    // reellement edite dans EditorModal, au lieu de regenerer depuis la BDD.
    // Conserve pour d'eventuels futurs usages (XLSX...), mais n'est plus
    // appele par l'editeur de fiche equipement (voir genererDocumentEditeImage).
    genererDocumentEdite: ({ idEquipement, format, donneesEditees }) =>
        axiosClient.post(
            '/documents/export/generate',
            { idEquipement, format, donneesEditees },
            {
                responseType: 'blob'
            }
        ),

    // Genere le PDF a partir des images capturees du rendu reel de
    // l'editeur (une image par page) - utilise par EditorModal / Detail.jsx
    // pour garantir une fidelite visuelle totale a l'edition.
    genererDocumentEditeImage: ({ idEquipement, images }) =>
        axiosClient.post(
            '/documents/export/generate-image',
            { idEquipement, images },
            {
                responseType: 'blob'
            }
        )

}