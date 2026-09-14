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
        )

}