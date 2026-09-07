/*

Nom du fichier   : categorieApi.js
Objectif         : Appels API du module Categories - CRUD complet + filtre par type
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026

*/

import axiosClient from './axiosClient'

export const categorieApi = {
    listerToutes: () => axiosClient.get('/categories'),
    listerParType: (type) => axiosClient.get(`/categories/type/${type}`),
    getParId: (id) => axiosClient.get(`/categories/${id}`),
    creer: (data) => axiosClient.post('/categories', data),
    modifier: (id, data) => axiosClient.put(`/categories/${id}`, data),
    supprimer: (id) => axiosClient.delete(`/categories/${id}`),
}