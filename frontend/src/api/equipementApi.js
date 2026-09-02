/*

Nom du fichier   : equipementApi.js
Objectif         : Appels API du module Equipements - dont le materiel de l'agent connecte
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026

*/

import axiosClient from './axiosClient'

export const equipementApi = {
  monMateriel: () => axiosClient.get('/equipements/mon-materiel'),
}