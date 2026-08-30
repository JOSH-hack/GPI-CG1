/*

Nom du fichier   : AppRoutes.jsx
Objectif         : Arbre de routage complet de l'application - routes publiques (auth), routes privées (authentification requise), routes restreintes par rôle (RBAC frontend)
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026

*/

import { Routes, Route, Navigate } from 'react-router-dom'
import { ROLES } from '../utils/constants'

import PrivateRoute from './PrivateRoute'
import RoleRoute from './RoleRoute'

import DashboardLayout from '../components/layout/DashboardLayout'

//  Auth (publiques) 
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

//  Dashboard 
import Dashboard from '../pages/dashboard/Dashboard'

//  Parc : Categories 
import CategoriesListe from '../pages/categories/Liste'
import CategorieForm from '../pages/categories/Form'

//  Parc : Equipements 
import EquipementsListe from '../pages/equipements/Liste'
import EquipementDetail from '../pages/equipements/Detail'
import EquipementFormMateriel from '../pages/equipements/FormMateriel'
import EquipementFormLogiciel from '../pages/equipements/FormLogiciel'
import EquipementFormReseau from '../pages/equipements/FormReseau'
import EquipementAffecter from '../pages/equipements/Affecter'
import EquipementDeplacer from '../pages/equipements/Deplacer'
import MonMateriel from '../pages/equipements/MonMateriel'

//  Assistance : Pannes 
import PannesListe from '../pages/pannes/Liste'
import PanneDetail from '../pages/pannes/Detail'
import PanneSignaler from '../pages/pannes/Signaler'
import MesSignalements from '../pages/pannes/MesSignalements'

//  Assistance : Interventions 
import InterventionsListe from '../pages/interventions/Liste'
import InterventionCreer from '../pages/interventions/Creer'
import InterventionDetail from '../pages/interventions/Detail'
import InterventionsEnAttenteDsi from '../pages/interventions/EnAttenteDsi'

//  Assistance : Messages (chat) 
import ChatIntervention from '../pages/messages/ChatIntervention'

//  Gestion : Utilisateurs 
import UtilisateursListe from '../pages/utilisateurs/Liste'
import UtilisateurDetail from '../pages/utilisateurs/Detail'

//  Gestion : Agents 
import AgentsListe from '../pages/agents/Liste'
import AgentForm from '../pages/agents/Form'

//  Gestion : Localisations 
import LocalisationsListe from '../pages/localisations/Liste'
import LocalisationForm from '../pages/localisations/Form'

//  Gestion : Suivi (par equipement) et Mouvements (liste globale) 
import Timeline from '../pages/historique/Timeline'
import MouvementsListe from '../pages/mouvements/Liste'

import NotFound from '../pages/NotFound'

export default function AppRoutes() {
    return (
        <Routes>
            {/*  ROUTES PUBLIQUES  */}
            <Route path="/login" element={<Login />} />
            {/* Register gere l'inscription ET la saisie du code de verification
          en un seul ecran en 2 etapes (pas de route separee) */}
            <Route path="/register" element={<Register />} />

            {/*  ROUTES PRIVEES  */}
            <Route element={<PrivateRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/*  Parc : Categories (Admin/DSI/Systeme)  */}
                    <Route
                        element={
                            <RoleRoute
                                allowedRoles={[ROLES.ADMIN_INFO, ROLES.RESPONSABLE_DSI, ROLES.ADMIN_SYSTEME]}
                            />
                        }
                    >
                        <Route path="/parc/categories" element={<CategoriesListe />} />
                        <Route path="/parc/categories/nouveau" element={<CategorieForm />} />
                    </Route>

                    {/*  Parc : Equipements  */}
                    {/* Consultation ouverte a tous les roles authentifies */}
                    <Route path="/parc/equipements" element={<EquipementsListe />} />
                    <Route path="/parc/equipements/:id" element={<EquipementDetail />} />

                    {/* Creation/modification reservees Technicien + Admin Info */}
                    <Route
                        element={<RoleRoute allowedRoles={[ROLES.TECHNICIEN, ROLES.ADMIN_INFO]} />}
                    >
                        <Route path="/parc/equipements/nouveau/materiel" element={<EquipementFormMateriel />} />
                        <Route path="/parc/equipements/nouveau/logiciel" element={<EquipementFormLogiciel />} />
                        <Route path="/parc/equipements/nouveau/reseau" element={<EquipementFormReseau />} />
                        <Route path="/parc/equipements/:id/affecter" element={<EquipementAffecter />} />
                        <Route path="/parc/equipements/:id/deplacer" element={<EquipementDeplacer />} />
                    </Route>

                    {/* Reserve a l'Agent : consultation de son propre materiel affecte */}
                    <Route element={<RoleRoute allowedRoles={[ROLES.AGENT]} />}>
                        <Route path="/mon-materiel" element={<MonMateriel />} />
                    </Route>

                    {/*  Assistance : Pannes  */}
                    <Route
                        element={
                            <RoleRoute
                                allowedRoles={[ROLES.TECHNICIEN, ROLES.ADMIN_INFO, ROLES.RESPONSABLE_DSI]}
                            />
                        }
                    >
                        <Route path="/assistance/pannes" element={<PannesListe />} />
                    </Route>
                    <Route path="/assistance/pannes/:id" element={<PanneDetail />} />

                    <Route element={<RoleRoute allowedRoles={[ROLES.AGENT, ROLES.TECHNICIEN]} />}>
                        <Route path="/assistance/pannes/signaler" element={<PanneSignaler />} />
                    </Route>

                    <Route element={<RoleRoute allowedRoles={[ROLES.AGENT]} />}>
                        <Route path="/assistance/mes-signalements" element={<MesSignalements />} />
                    </Route>

                    {/*  Assistance : Interventions  */}
                    <Route element={<RoleRoute allowedRoles={[ROLES.TECHNICIEN]} />}>
                        <Route path="/assistance/interventions" element={<InterventionsListe />} />
                        <Route path="/assistance/interventions/creer/:idPanne" element={<InterventionCreer />} />
                    </Route>
                    <Route path="/assistance/interventions/:id" element={<InterventionDetail />} />

                    <Route element={<RoleRoute allowedRoles={[ROLES.RESPONSABLE_DSI]} />}>
                        <Route path="/assistance/interventions/en-attente-dsi" element={<InterventionsEnAttenteDsi />} />
                    </Route>

                    {/*  Assistance : Chat (participants verifies cote backend)  */}
                    <Route path="/assistance/messages/:idIntervention" element={<ChatIntervention />} />

                    {/*  Gestion : Utilisateurs (Admin/DSI)  */}
                    <Route
                        element={<RoleRoute allowedRoles={[ROLES.ADMIN_INFO, ROLES.RESPONSABLE_DSI]} />}
                    >
                        <Route path="/gestion/utilisateurs" element={<UtilisateursListe />} />
                        <Route path="/gestion/utilisateurs/:id" element={<UtilisateurDetail />} />
                    </Route>

                    {/*  Gestion : Agents (Admin Info)  */}
                    <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN_INFO]} />}>
                        <Route path="/gestion/agents" element={<AgentsListe />} />
                        <Route path="/gestion/agents/nouveau" element={<AgentForm />} />
                    </Route>

                    {/*  Gestion : Localisations (Admin/DSI/Systeme)  */}
                    <Route
                        element={
                            <RoleRoute
                                allowedRoles={[ROLES.ADMIN_INFO, ROLES.RESPONSABLE_DSI, ROLES.ADMIN_SYSTEME]}
                            />
                        }
                    >
                        <Route path="/gestion/localisations" element={<LocalisationsListe />} />
                        <Route path="/gestion/localisations/nouveau" element={<LocalisationForm />} />
                    </Route>

                    {/*  Gestion : Suivi (par equipement) et Mouvements (liste globale)  */}
                    <Route
                        element={
                            <RoleRoute
                                allowedRoles={[
                                    ROLES.ADMIN_INFO,
                                    ROLES.RESPONSABLE_DSI,
                                    ROLES.ADMIN_SYSTEME,
                                    ROLES.TECHNICIEN,
                                ]}
                            />
                        }
                    >
                        <Route path="/gestion/suivi" element={<Timeline />} />
                        <Route path="/gestion/mouvements" element={<MouvementsListe />} />
                    </Route>
                </Route>
            </Route>

            {/*  404  */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}