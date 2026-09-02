/*

Nom du fichier   : utilisateurApi.js
Objectif         : Appels API du module Gestion des utilisateurs - liste, detail, changement de role, activation/desactivation
Propriétaire     : Josué BEDEL
Date de création : 01/09/2026

*/

import axiosClient from './axiosClient'

export const utilisateurApi = {
    listerTous: () => axiosClient.get('/utilisateurs'),
    listerActifs: () => axiosClient.get('/utilisateurs/actifs'),
    listerParRole: (role) => axiosClient.get(`/utilisateurs/role/${role}`),
    getParId: (id) => axiosClient.get(`/utilisateurs/${id}`),
    changerRole: (id, nouveauRole) =>
        axiosClient.put(`/utilisateurs/${id}/role`, null, { params: { nouveauRole } }),
    activer: (id) => axiosClient.put(`/utilisateurs/${id}/activer`),
    desactiver: (id) => axiosClient.put(`/utilisateurs/${id}/desactiver`),
}