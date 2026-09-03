/*

Nom du fichier   : interventionApi.js
Objectif         : Appels API du module Interventions - creation, diagnostic,
                    resultat, rapport, validation DSI, consultation
Propriétaire     : Josué BEDEL
Date de création : 03/09/2026

*/

import axiosClient from './axiosClient'

export const interventionApi = {
    listerToutes: () => axiosClient.get('/interventions'),
    getParId: (id) => axiosClient.get(`/interventions/${id}`),
    listerParPanne: (idPanne) => axiosClient.get(`/interventions/panne/${idPanne}`),
    listerEnAttenteDsi: () => axiosClient.get('/interventions/en-attente-dsi'),

    creer: (data) => axiosClient.post('/interventions', data),

    enregistrerDiagnostic: (id, { diagnostic, solution, piecesRemplacees }) =>
        axiosClient.put(`/interventions/${id}/diagnostic`, null, {
            params: { diagnostic, solution, piecesRemplacees },
        }),

    enregistrerResultat: (id, resultat) =>
        axiosClient.put(`/interventions/${id}/resultat`, null, { params: { resultat } }),

    redigerRapport: (id, rapport) =>
        axiosClient.post(`/interventions/${id}/rapport`, null, { params: { rapport } }),

    valider: (id) => axiosClient.post(`/interventions/${id}/valider`),
}