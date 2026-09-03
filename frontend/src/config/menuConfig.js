/*

Nom du fichier   : menuConfig.js
Objectif         : Configuration centralisee du menu de navigation par role - source unique de verite pour Sidebar.jsx et Navbar.jsx. Chaque entree correspond a une route reellement protegee par un RoleRoute dans AppRoutes.jsx - toute divergence entre les deux cree soit un lien mort (RoleRoute plus stricte que le menu), soit une fonctionnalite invisible (RoleRoute plus permissive que le menu).
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026
Date de mise à jour : 03/09/2026
Objet de mise à jour : ADMIN_SYSTEME (super admin) n'est plus une liste maintenue a la
                        main - son menu est desormais calcule automatiquement comme la
                        fusion de tout ce que les 4 autres roles peuvent voir (voir
                        fusionnerMenus ci-dessous). Coherent avec RoleRoute.jsx, qui
                        fait desormais passer ADMIN_SYSTEME sur n'importe quelle route
                        peu importe les allowedRoles declares, et avec le RoleHierarchy
                        cote backend (SecurityConfig.java).

*/

import { ROLES } from '../utils/constants'

import iconParc from '../assets/icons/icon-parc.svg'
import iconAssistance from '../assets/icons/icon-assistance.svg'
import iconGestion from '../assets/icons/icon-gestion.svg'
import iconUtilisateurs from '../assets/icons/icon-utilisateurs.svg'
import iconEquipements from '../assets/icons/icon-equipements.svg'
import iconSuivi from '../assets/icons/icon-suivi.svg'
import iconMouvements from '../assets/icons/icon-mouvements.svg'
import iconProfil from '../assets/icons/icon-profil.svg'
import pannesIcon from '../assets/icons/pannes-icon.svg'
import dashboardIcon from '../assets/icons/dashboard-icon.svg'

// Chaque item : { label, icon, path?, children?: [...] }
// "path" absent => l'item n'est qu'un groupe deroulant (pas de navigation directe)
// Chaque "path" ci-dessous doit correspondre exactement a une route existante
// dans AppRoutes.jsx, et la liste de roles autorisee doit correspondre au
// RoleRoute qui la protege - sinon lien mort ou fonctionnalite cachee.

const ITEM_CATEGORIES = { label: 'Categories', icon: iconEquipements, path: '/parc/categories' }
const ITEM_EQUIPEMENTS = { label: 'Equipements', icon: iconEquipements, path: '/parc/equipements' }
const ITEM_UTILISATEURS = { label: 'Utilisateurs', icon: iconUtilisateurs, path: '/gestion/utilisateurs' }
const ITEM_AGENTS = { label: 'Agents', icon: iconUtilisateurs, path: '/gestion/agents' }
const ITEM_LOCALISATIONS = { label: 'Localisations', icon: iconEquipements, path: '/gestion/localisations' }
const ITEM_SUIVI = { label: 'Suivi', icon: iconSuivi, path: '/gestion/suivi' }
const ITEM_MOUVEMENTS = { label: 'Mouvements', icon: iconMouvements, path: '/gestion/mouvements' }
const ITEM_PANNES = { label: 'Pannes', icon: pannesIcon, path: '/assistance/pannes' }
const ITEM_INTERVENTIONS = { label: 'Interventions', icon: iconSuivi, path: '/assistance/interventions' }
const ITEM_INTERVENTIONS_EN_ATTENTE = {
    label: 'Interventions en attente',
    icon: iconSuivi,
    path: '/assistance/interventions/en-attente-dsi',
}
const ITEM_SIGNALER_PANNE = {
    label: 'Signaler une Panne',
    icon: pannesIcon,
    path: '/assistance/pannes/signaler',
}
const ITEM_TABLEAU_DE_BORD = { label: 'Tableau de Bord', icon: dashboardIcon, path: '/dashboard' }

// Menus des 4 roles "normaux". ADMIN_SYSTEME (super admin) n'est PAS defini ici :
// son menu est calcule plus bas comme la fusion de ces 4-la, pour ne jamais avoir
// besoin d'etre mis a jour manuellement quand une page est ajoutee a un role.
const MENUS_PAR_ROLE_SAUF_SUPER_ADMIN = {
    // RoleRoute reelles : mon-materiel (AGENT), mes-signalements (AGENT),
    // pannes/signaler (AGENT, TECHNICIEN)
    [ROLES.AGENT]: [
        {
            label: 'Assistance',
            icon: iconAssistance,
            children: [
                ITEM_TABLEAU_DE_BORD,
                { label: 'Mon Matériel', icon: iconEquipements, path: '/mon-materiel' },
                { label: 'Mes Signalements', icon: pannesIcon, path: '/assistance/mes-signalements' },
                ITEM_SIGNALER_PANNE,
            ],
        },
    ],

    // RoleRoute reelles : equipements consultation (ouvert a tous), pannes liste
    // (TECHNICIEN, ADMIN_INFO, RESPONSABLE_DSI, ADMIN_SYSTEME), pannes/signaler
    // (AGENT, TECHNICIEN), interventions (TECHNICIEN, ADMIN_SYSTEME, ADMIN_INFO),
    // interventions/ticket (TECHNICIEN, ADMIN_SYSTEME), suivi/mouvements
    // (ADMIN_INFO, RESPONSABLE_DSI, ADMIN_SYSTEME, TECHNICIEN)
    [ROLES.TECHNICIEN]: [
        { label: 'Parc', icon: iconParc, children: [ITEM_EQUIPEMENTS] },
        {
            label: 'Assistance',
            icon: iconAssistance,
            children: [ITEM_TABLEAU_DE_BORD, ITEM_PANNES, ITEM_SIGNALER_PANNE, ITEM_INTERVENTIONS],
        },
        { label: 'Gestion', icon: iconGestion, children: [ITEM_SUIVI, ITEM_MOUVEMENTS] },
    ],

    // RoleRoute reelles : categories (ADMIN_INFO, RESPONSABLE_DSI, ADMIN_SYSTEME),
    // pannes liste (inclus), interventions (TECHNICIEN, ADMIN_SYSTEME, ADMIN_INFO),
    // interventions en-attente-dsi (RESPONSABLE_DSI, ADMIN_INFO, ADMIN_SYSTEME),
    // utilisateurs (ADMIN_INFO, RESPONSABLE_DSI, ADMIN_SYSTEME), agents
    // (ADMIN_INFO, ADMIN_SYSTEME), localisations/suivi/mouvements (les 3 admins + technicien)
    [ROLES.ADMIN_INFO]: [
        { label: 'Parc', icon: iconParc, children: [ITEM_CATEGORIES, ITEM_EQUIPEMENTS] },
        {
            label: 'Assistance',
            icon: iconAssistance,
            children: [ITEM_PANNES, ITEM_INTERVENTIONS, ITEM_INTERVENTIONS_EN_ATTENTE],
        },
        {
            label: 'Gestion',
            icon: iconGestion,
            children: [ITEM_UTILISATEURS, ITEM_AGENTS, ITEM_LOCALISATIONS, ITEM_SUIVI, ITEM_MOUVEMENTS],
        },
    ],

    // RoleRoute reelles : categories (inclus), pannes liste (inclus),
    // interventions/en-attente-dsi (inclus), utilisateurs (inclus), PAS agents
    // (ADMIN_INFO/ADMIN_SYSTEME uniquement), localisations/suivi/mouvements (inclus)
    [ROLES.RESPONSABLE_DSI]: [
        { label: 'Parc', icon: iconParc, children: [ITEM_CATEGORIES, ITEM_EQUIPEMENTS] },
        {
            label: 'Assistance',
            icon: iconAssistance,
            children: [ITEM_PANNES, ITEM_INTERVENTIONS, ITEM_INTERVENTIONS_EN_ATTENTE],
        },
        {
            label: 'Gestion',
            icon: iconGestion,
            children: [ITEM_UTILISATEURS, ITEM_LOCALISATIONS, ITEM_SUIVI, ITEM_MOUVEMENTS],
        },
    ],
}

// Fusionne plusieurs menus (tableaux de groupes {label, icon, children}) en un
// seul : les groupes de meme label sont combines, et les enfants dedupliques
// par "path" pour eviter les doublons quand plusieurs roles partagent un meme
// lien (ex: Pannes present chez Technicien ET Admin Info).
function fusionnerMenus(menus) {
    const groupesParLabel = new Map()

    menus.forEach((menuDuRole) => {
        menuDuRole.forEach((groupe) => {
            if (!groupesParLabel.has(groupe.label)) {
                groupesParLabel.set(groupe.label, {
                    label: groupe.label,
                    icon: groupe.icon,
                    children: [],
                    cheminsDejaVus: new Set(),
                })
            }
            const groupeFusionne = groupesParLabel.get(groupe.label)
                ; (groupe.children || []).forEach((item) => {
                    if (!groupeFusionne.cheminsDejaVus.has(item.path)) {
                        groupeFusionne.cheminsDejaVus.add(item.path)
                        groupeFusionne.children.push(item)
                    }
                })
        })
    })

    return Array.from(groupesParLabel.values()).map(({ label, icon, children }) => ({
        label,
        icon,
        children,
    }))
}

export const MENU_PAR_ROLE = {
    ...MENUS_PAR_ROLE_SAUF_SUPER_ADMIN,
    // ADMIN_SYSTEME = super admin : voit et peut naviguer vers absolument tout ce
    // que n'importe quel autre role peut voir, sans exception et sans maintenance
    // manuelle a chaque nouvelle page (voir RoleRoute.jsx pour le pendant "acces
    // reellement autorise", et SecurityConfig.java cote backend).
    [ROLES.ADMIN_SYSTEME]: fusionnerMenus(Object.values(MENUS_PAR_ROLE_SAUF_SUPER_ADMIN)),
}

export { iconProfil }