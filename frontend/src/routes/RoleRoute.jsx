/*

Nom du fichier   : RoleRoute.jsx
Objectif         : Contrôle d'accès par rôle (RBAC frontend) - restreint une route à une liste de rôles autorisés, redirige vers le tableau de bord sinon. À utiliser imbriqué sous PrivateRoute (l'authentification est déjà garantie)
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026

*/

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RoleRoute({ allowedRoles }) {
    const { user } = useAuth()

    const estAutorise = user && allowedRoles.includes(user.role)

    if (!estAutorise) {
        // Rappel : ceci est un controle cote UI pour l'experience utilisateur
        // (cacher/rediriger). La vraie securite reste le backend (@PreAuthorize),
        // qui refuse deja ces actions avec un 403 meme si ce garde-fou etait
        // contourne.
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}