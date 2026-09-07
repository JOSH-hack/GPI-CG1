/*

Nom du fichier   : localisationApi.js
Objectif         : Appels API du module Localisations - CRUD + recherche par annexe/service
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026

*/

import axiosClient from './axiosClient'

export const localisationApi = {
    listerToutes: () => axiosClient.get('/localisations'),
    getParId: (id) => axiosClient.get(`/localisations/${id}`),
    rechercher: (params) => axiosClient.get('/localisations/recherche', { params }),
    creer: (data) => axiosClient.post('/localisations', data),
    modifier: (id, data) => axiosClient.put(`/localisations/${id}`, data),
    supprimer: (id) => axiosClient.delete(`/localisations/${id}`),
}