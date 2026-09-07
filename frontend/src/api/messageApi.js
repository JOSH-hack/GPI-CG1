/*

Nom du fichier   : messageApi.js
Objectif         : Appels API du chat d'intervention - uniquement l'historique
                    (l'envoi passe par le WebSocket, voir useWebSocketChat)
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import axiosClient from './axiosClient'

export const messageApi = {
    listerParIntervention: (idIntervention) => axiosClient.get(`/messages/intervention/${idIntervention}`),
}