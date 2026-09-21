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
 * Objet de mise à jour : Ajout de telechargerAutocollant() et
 *                        genererDocumentEditeImage().
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

    // Autocollant d'identification (~100mm x 60mm) a coller sur l'équipement -
    // toujours base sur les données actuelles de la BDD, pas de version "éditée".
    telechargerAutocollant: (idEquipement) =>
        axiosClient.get(
            `/documents/equipement/${idEquipement}/autocollant-pdf`,
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