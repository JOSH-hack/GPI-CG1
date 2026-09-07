/*

Nom du fichier   : historiqueApi.js
Objectif         : Appels API historique des mouvements
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import axiosClient from './axiosClient'

export const historiqueApi = {
    timelineParEquipement: (idEquipement) => axiosClient.get(`/historique-mouvements/equipement/${idEquipement}/timeline`),
    listerTout: () => axiosClient.get('/historique-mouvements'),
    listerParType: (type) => axiosClient.get(`/historique-mouvements/type/${type}`),
    listerParOperateur: (idOperateur) => axiosClient.get(`/historique-mouvements/operateur/${idOperateur}`),
    listerParPeriode: (debut, fin) =>
        axiosClient.get('/historique-mouvements/periode', { params: { debut, fin } }),
}