/*

Nom du fichier   : panneApi.js
Objectif         : Appels API du module Pannes - signalement et suivi cote agent
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026

*/

import axiosClient from './axiosClient'

export const panneApi = {
    signaler: (data) => axiosClient.post('/pannes/signaler', data),
    mesSignalements: () => axiosClient.get('/pannes/mes-signalements'),
}