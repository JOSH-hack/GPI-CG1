/*

Nom du fichier   : outilsApi.js
Objectif         : Appels API du module Outils - sauvegardes de la base de
                    donnees et logs systeme
Propriétaire     : Josué BEDEL
Date de création : 10/09/2026

*/

import axiosClient from './axiosClient'

function declencherTelechargement(blob, nomFichier) {
    const url = URL.createObjectURL(blob)
    const lien = document.createElement('a')
    lien.href = url
    lien.download = nomFichier
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    URL.revokeObjectURL(url)
}

export const outilsApi = {
    tailleBase: () => axiosClient.get('/outils/sauvegardes/taille-base'),
    listerSauvegardes: () => axiosClient.get('/outils/sauvegardes'),
    effectuerSauvegarde: () => axiosClient.post('/outils/sauvegardes/effectuer'),
    restaurerSauvegarde: (id) => axiosClient.post(`/outils/sauvegardes/${id}/restaurer`),
    async telechargerSauvegarde(id, nomFichier) {
        const response = await axiosClient.get(`/outils/sauvegardes/${id}/telecharger`, { responseType: 'blob' })
        declencherTelechargement(response.data, nomFichier)
    },
    listerLogs: (niveau, page = 0, taille = 10) =>
        axiosClient.get('/outils/logs', { params: { niveau: niveau === 'Tous' ? undefined : niveau, page, taille } }),
}