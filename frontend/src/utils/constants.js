/*

Nom du fichier   : constants.js
Objectif         : Constantes partagées de l'application - enums alignés sur le backend (rôles, statuts, priorités, types), avec libellés français et couleurs MUI associées pour les badges/Chips
Propriétaire     : Josué BEDEL
Date de création : 27/08/2026

*/

//  Rôles utilisateur --
export const ROLES = {
    ADMIN_INFO: 'ADMIN_INFO',
    TECHNICIEN: 'TECHNICIEN',
    RESPONSABLE_DSI: 'RESPONSABLE_DSI',
    ADMIN_SYSTEME: 'ADMIN_SYSTEME',
    AGENT: 'AGENT',
}

export const ROLE_LABELS = {
    [ROLES.ADMIN_INFO]: 'Administrateur Informatique',
    [ROLES.TECHNICIEN]: 'Technicien',
    [ROLES.RESPONSABLE_DSI]: 'Responsable DSI',
    [ROLES.ADMIN_SYSTEME]: 'Administrateur Système',
    [ROLES.AGENT]: 'Agent',
}

//  Statut équipement -
export const STATUT_EQUIPEMENT = {
    EN_SERVICE: 'EN_SERVICE',
    EN_STOCK: 'EN_STOCK',
    EN_PANNE: 'EN_PANNE',
    MIS_AU_REBUT: 'MIS_AU_REBUT',
}

export const STATUT_EQUIPEMENT_LABELS = {
    [STATUT_EQUIPEMENT.EN_SERVICE]: 'En service',
    [STATUT_EQUIPEMENT.EN_STOCK]: 'En stock',
    [STATUT_EQUIPEMENT.EN_PANNE]: 'En panne',
    [STATUT_EQUIPEMENT.MIS_AU_REBUT]: 'Mis au rebut',
}

export const STATUT_EQUIPEMENT_COLORS = {
    [STATUT_EQUIPEMENT.EN_SERVICE]: 'success',
    [STATUT_EQUIPEMENT.EN_STOCK]: 'info',
    [STATUT_EQUIPEMENT.EN_PANNE]: 'error',
    [STATUT_EQUIPEMENT.MIS_AU_REBUT]: 'default',
}

//  Statut panne 
export const STATUT_PANNE = {
    SIGNALEE: 'SIGNALEE',
    EN_COURS_TRAITEMENT: 'EN_COURS_TRAITEMENT',
    REPAREE: 'REPAREE',
    REFORMEE: 'REFORMEE',
}

export const STATUT_PANNE_LABELS = {
    [STATUT_PANNE.SIGNALEE]: 'Signalée',
    [STATUT_PANNE.EN_COURS_TRAITEMENT]: 'En cours de traitement',
    [STATUT_PANNE.REPAREE]: 'Réparée',
    [STATUT_PANNE.REFORMEE]: 'Réformée',
}

export const STATUT_PANNE_COLORS = {
    [STATUT_PANNE.SIGNALEE]: 'info',
    [STATUT_PANNE.EN_COURS_TRAITEMENT]: 'warning',
    [STATUT_PANNE.REPAREE]: 'success',
    [STATUT_PANNE.REFORMEE]: 'default',
}

//  Priorité panne --
export const PRIORITE_PANNE = {
    FAIBLE: 'FAIBLE',
    MOYENNE: 'MOYENNE',
    ELEVEE: 'ELEVEE',
    CRITIQUE: 'CRITIQUE',
}

export const PRIORITE_PANNE_LABELS = {
    [PRIORITE_PANNE.FAIBLE]: 'Faible',
    [PRIORITE_PANNE.MOYENNE]: 'Moyenne',
    [PRIORITE_PANNE.ELEVEE]: 'Élevée',
    [PRIORITE_PANNE.CRITIQUE]: 'Critique',
}

export const PRIORITE_PANNE_COLORS = {
    [PRIORITE_PANNE.FAIBLE]: 'default',
    [PRIORITE_PANNE.MOYENNE]: 'info',
    [PRIORITE_PANNE.ELEVEE]: 'warning',
    [PRIORITE_PANNE.CRITIQUE]: 'error',
}

//  Type intervention -
export const TYPE_INTERVENTION = {
    A_DISTANCE: 'A_DISTANCE',
    EN_PRESENTIEL: 'EN_PRESENTIEL',
}

export const TYPE_INTERVENTION_LABELS = {
    [TYPE_INTERVENTION.A_DISTANCE]: 'À distance',
    [TYPE_INTERVENTION.EN_PRESENTIEL]: 'Sur site',
}

//  Résultat intervention -
export const RESULTAT_INTERVENTION = {
    REPARATION: 'REPARATION',
    DEPANNAGE: 'DEPANNAGE',
}

export const RESULTAT_INTERVENTION_LABELS = {
    [RESULTAT_INTERVENTION.REPARATION]: 'Réparation',
    [RESULTAT_INTERVENTION.DEPANNAGE]: 'Dépannage',
}

//  Type mouvement (historique) -
export const TYPE_MOUVEMENT = {
    DEPLACEMENT: 'DEPLACEMENT',
    CHANGEMENT_STATUT: 'CHANGEMENT_STATUT',
    AFFECTATION: 'AFFECTATION',
}

export const TYPE_MOUVEMENT_LABELS = {
    [TYPE_MOUVEMENT.DEPLACEMENT]: 'Déplacement',
    [TYPE_MOUVEMENT.CHANGEMENT_STATUT]: 'Changement de statut',
    [TYPE_MOUVEMENT.AFFECTATION]: 'Affectation',
}

// Couleurs alignees sur la maquette Figma de la page Mouvements
export const TYPE_MOUVEMENT_COLORS = {
    [TYPE_MOUVEMENT.DEPLACEMENT]: 'info',
    [TYPE_MOUVEMENT.CHANGEMENT_STATUT]: 'warning',
    [TYPE_MOUVEMENT.AFFECTATION]: 'success',
}

//  Type catégorie 
export const TYPE_CATEGORIE = {
    HARDWARE: 'HARDWARE',
    SOFTWARE: 'SOFTWARE',
    RESEAU: 'RESEAU',
}

export const TYPE_CATEGORIE_LABELS = {
    [TYPE_CATEGORIE.HARDWARE]: 'Matériel',
    [TYPE_CATEGORIE.SOFTWARE]: 'Logiciel',
    [TYPE_CATEGORIE.RESEAU]: 'Réseau',
}

//  Type adresse réseau 
export const TYPE_ADRESSE_RESEAU = {
    STATIQUE: 'STATIQUE',
    DYNAMIQUE: 'DYNAMIQUE',
}

export const TYPE_ADRESSE_RESEAU_LABELS = {
    [TYPE_ADRESSE_RESEAU.STATIQUE]: 'Statique',
    [TYPE_ADRESSE_RESEAU.DYNAMIQUE]: 'Dynamique',
}

//  Type pièce jointe 
export const TYPE_PIECE_JOINTE = {
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    PDF: 'PDF',
}

export const TYPE_PIECE_JOINTE_LABELS = {
    [TYPE_PIECE_JOINTE.IMAGE]: 'Image',
    [TYPE_PIECE_JOINTE.VIDEO]: 'Vidéo',
    [TYPE_PIECE_JOINTE.PDF]: 'PDF',
}