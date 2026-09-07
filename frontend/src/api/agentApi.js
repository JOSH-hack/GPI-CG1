/*

Nom du fichier   : agentApi.js
Objectif         : Appels API du module Agents - creation/modification de fiche agent, consultation par utilisateur
Propriétaire     : Josué BEDEL
Date de création : 01/09/2026

*/

import axiosClient from './axiosClient'

export const agentApi = {
    listerTous: () => axiosClient.get('/agents'),
    getParId: (id) => axiosClient.get(`/agents/${id}`),
    getParUtilisateur: (idUtilisateur) => axiosClient.get(`/agents/utilisateur/${idUtilisateur}`),
    rechercherParNom: (nom) => axiosClient.get('/agents/recherche', { params: { nom } }),
    creer: (data) => axiosClient.post('/agents', data),
    modifier: (id, data) => axiosClient.put(`/agents/${id}`, data),
}