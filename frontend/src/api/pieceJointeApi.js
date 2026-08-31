/*

Nom du fichier   : pieceJointeApi.js
Objectif         : Appels API du module Pieces jointes - upload multipart, consultation, suppression, liste par panne
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026

*/

import axiosClient from './axiosClient'

export const pieceJointeApi = {
    upload: (file, idPanne, typeFichier) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('idPanne', idPanne)
        formData.append('typeFichier', typeFichier)

        return axiosClient.post('/pieces-jointes/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    listerParPanne: (idPanne) => axiosClient.get(`/pieces-jointes/panne/${idPanne}`),

    supprimer: (id) => axiosClient.delete(`/pieces-jointes/${id}`),

    getStreamUrl: (id) => `${axiosClient.defaults.baseURL}/pieces-jointes/${id}/stream`,
}