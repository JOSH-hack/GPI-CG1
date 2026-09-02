/*

Nom du fichier   : PrivateRoute.jsx
Objectif         : Protège les routes nécessitant une authentification - affiche un loader pendant la restauration de session, redirige vers /login si non connecté
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026

*/

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute() {
    const { isAuthenticated, loading } = useAuth()
    const location = useLocation()

    // Tant que AuthContext n'a pas fini de verifier le token au demarrage,
    // on affiche un loader plutot que de rediriger prematurement un
    // utilisateur en fait deja connecte.
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        )
    }

    if (!isAuthenticated) {
        // On garde la page demandee en memoire (state) pour y rediriger
        // automatiquement une fois la connexion reussie.
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <Outlet />
}