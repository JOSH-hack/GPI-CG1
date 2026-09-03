/*

Nom du fichier   : RoleRoute.jsx
Objectif         : Contrôle d'accès par rôle (RBAC frontend) - restreint une route à une liste de rôles autorisés, redirige vers le tableau de bord sinon. À utiliser imbriqué sous PrivateRoute (l'authentification est déjà garantie).
                    ADMIN_SYSTEME est le "super admin" : il passe TOUJOURS, quels que
                    soient les allowedRoles declares sur la route (voir aussi la
                    hierarchie de roles equivalente cote backend dans SecurityConfig.java,
                    qui applique la meme regle sur les @PreAuthorize).
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026
Date de mise à jour : 03/09/2026
Objet de mise à jour : ADMIN_SYSTEME (super admin) contourne desormais tout controle de role

*/

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../utils/constants'

export default function RoleRoute({ allowedRoles }) {
    const { user } = useAuth()

    const estSuperAdmin = user?.role === ROLES.ADMIN_SYSTEME
    const estAutorise = estSuperAdmin || (user && allowedRoles.includes(user.role))

    if (!estAutorise) {
        // Rappel : ceci est un controle cote UI pour l'experience utilisateur
        // (cacher/rediriger). La vraie securite reste le backend (@PreAuthorize),
        // qui refuse deja ces actions avec un 403 meme si ce garde-fou etait
        // contourne.
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}