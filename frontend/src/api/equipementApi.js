/*

Nom du fichier   : equipementApi.js
Objectif         : Appels API du module Equipements - creation des 3 sous-types
                    (materiel/logiciel/reseau), actions metier (affecter/deplacer/
                    mettre au rebut), consultation (liste, par id, par statut, par
                    categorie, par code inventaire) et vue agent (mon-materiel)
Propriétaire     : Josué BEDEL
Date de création : 01/09/2026

*/

import axiosClient from './axiosClient'

export const equipementApi = {
  //  Creation (sous-types) 
  creerMateriel: (data) => axiosClient.post('/equipements/materiel', data),
  creerLogiciel: (data) => axiosClient.post('/equipements/logiciel', data),
  creerReseau: (data) => axiosClient.post('/equipements/reseau', data),

  //  Actions metier 
  // idAgent, idNouvelleLocalisation et motif partent en query params (@RequestParam cote backend)
  affecterAgent: (id, idAgent) =>
    axiosClient.post(`/equipements/${id}/affecter`, null, { params: { idAgent } }),
  deplacer: (id, idNouvelleLocalisation, motif) =>
    axiosClient.post(`/equipements/${id}/deplacer`, null, {
      params: { idNouvelleLocalisation, motif },
    }),
  mettreAuRebut: (id, motif) =>
    axiosClient.post(`/equipements/${id}/mettre-au-rebut`, null, { params: { motif } }),

  //  Consultation (ADMIN_INFO / ADMIN_SYSTEME / TECHNICIEN / RESPONSABLE_DSI) 
  listerTous: () => axiosClient.get('/equipements'),
  getParId: (id) => axiosClient.get(`/equipements/${id}`),
  listerParStatut: (statut) => axiosClient.get(`/equipements/statut/${statut}`),
  listerParCategorie: (idCategorie) => axiosClient.get(`/equipements/categorie/${idCategorie}`),
  getParCodeInventaire: (codeInventaire) =>
    axiosClient.get(`/equipements/code/${encodeURIComponent(codeInventaire)}`),

  //  Vue AGENT - son propre materiel 
  monMateriel: () => axiosClient.get('/equipements/mon-materiel'),
}