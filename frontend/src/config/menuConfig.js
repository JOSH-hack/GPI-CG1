/*

Nom du fichier   : menuConfig.js
Objectif         : Configuration centralisee du menu de navigation par role -
                    source unique de verite pour Sidebar.jsx et Navbar.jsx
                    (evite la duplication qu'on avait entre Liste.jsx et Dashboard.jsx)
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026

*/

import { ROLES } from '../utils/constants'

import iconParc from '../assets/icons/icon-parc.svg'
import iconAssistance from '../assets/icons/icon-assistance.svg'
import iconGestion from '../assets/icons/icon-gestion.svg'
import iconOutils from '../assets/icons/icon-outils.svg'
import iconUtilisateurs from '../assets/icons/icon-utilisateurs.svg'
import iconEquipements from '../assets/icons/icon-equipements.svg'
import iconSuivi from '../assets/icons/icon-suivi.svg'
import iconMouvements from '../assets/icons/icon-mouvements.svg'
import iconProfil from '../assets/icons/icon-profil.svg'
import pannesIcon from '../assets/icons/pannes-icon.svg'
import dashboardIcon from '../assets/icons/dashboard-icon.svg'

// Chaque item : { label, icon, path?, children?: [...] }
// "path" absent => l'item n'est qu'un groupe deroulant (pas de navigation directe)

const MENU_PARC_COMPLET = {
    label: 'Parc',
    icon: iconParc,
    children: [
        { label: 'Categories', icon: iconEquipements, path: '/parc/categories' },
        { label: 'Equipements', icon: iconEquipements, path: '/parc/equipements' },
    ],
}

const MENU_PARC_CONSULTATION = {
    label: 'Parc',
    icon: iconParc,
    children: [{ label: 'Equipements', icon: iconEquipements, path: '/parc/equipements' }],
}

const MENU_GESTION_COMPLET = {
    label: 'Gestion',
    icon: iconGestion,
    children: [
        { label: 'Utilisateurs', icon: iconUtilisateurs, path: '/gestion/utilisateurs' },
        { label: 'Agents', icon: iconUtilisateurs, path: '/gestion/agents' },
        { label: 'Localisations', icon: iconEquipements, path: '/gestion/localisations' },
        { label: 'Suivi', icon: iconSuivi, path: '/gestion/suivi' },
        { label: 'Mouvements', icon: iconMouvements, path: '/gestion/mouvements' },
    ],
}

const MENU_GESTION_DSI = {
    label: 'Gestion',
    icon: iconGestion,
    children: [
        { label: 'Utilisateurs', icon: iconUtilisateurs, path: '/gestion/utilisateurs' },
        { label: 'Localisations', icon: iconEquipements, path: '/gestion/localisations' },
        { label: 'Suivi', icon: iconSuivi, path: '/gestion/suivi' },
        { label: 'Mouvements', icon: iconMouvements, path: '/gestion/mouvements' },
    ],
}

const MENU_GESTION_TECHNICIEN = {
    label: 'Gestion',
    icon: iconGestion,
    children: [
        { label: 'Suivi', icon: iconSuivi, path: '/gestion/suivi' },
        { label: 'Mouvements', icon: iconMouvements, path: '/gestion/mouvements' },
    ],
}

export const MENU_PAR_ROLE = {
    [ROLES.AGENT]: [
        {
            label: 'Assistance',
            icon: iconAssistance,
            children: [
                { label: 'Tableau de Bord', icon: dashboardIcon, path: '/dashboard' },
                { label: 'Mon Matériel', icon: iconEquipements, path: '/mon-materiel' },
                { label: 'Mes Signalements', icon: pannesIcon, path: '/assistance/mes-signalements' },
                { label: 'Signaler une Panne', icon: iconSuivi, path: '/assistance/pannes/signaler' },
            ],
        },
    ],

    [ROLES.TECHNICIEN]: [
        MENU_PARC_CONSULTATION,
        {
            label: 'Assistance',
            icon: iconAssistance,
            children: [
                { label: 'Pannes', icon: pannesIcon, path: '/assistance/pannes' },
                { label: 'Interventions', icon: iconSuivi, path: '/assistance/interventions' },
            ],
        },
        MENU_GESTION_TECHNICIEN,
    ],

    [ROLES.ADMIN_INFO]: [
        MENU_PARC_COMPLET,
        {
            label: 'Assistance',
            icon: iconAssistance,
            children: [{ label: 'Pannes', icon: pannesIcon, path: '/assistance/pannes' }],
        },
        MENU_GESTION_COMPLET,
    ],

    [ROLES.RESPONSABLE_DSI]: [
        MENU_PARC_CONSULTATION,
        {
            label: 'Assistance',
            icon: iconAssistance,
            children: [
                { label: 'Pannes', icon: pannesIcon, path: '/assistance/pannes' },
                { label: 'Interventions en attente', icon: iconSuivi, path: '/assistance/interventions/en-attente-dsi' },
            ],
        },
        MENU_GESTION_DSI,
    ],

    [ROLES.ADMIN_SYSTEME]: [
        MENU_PARC_COMPLET,
        {
            label: 'Assistance',
            icon: iconAssistance,
            children: [
                { label: 'Pannes', icon: pannesIcon, path: '/assistance/pannes' },
                { label: 'Interventions', icon: iconSuivi, path: '/assistance/interventions' },
            ],
        },
        MENU_GESTION_COMPLET,
        { label: 'Outils', icon: iconOutils, children: [] },
    ],
}

export { iconProfil }