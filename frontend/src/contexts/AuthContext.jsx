/*

Nom du fichier   : AuthContext.jsx
Objectif         : Contexte d'authentification global - login, logout, utilisateur courant, rôle.
                    Le token vit desormais dans un cookie httpOnly (illisible en JS),
                    donc plus de decodage JWT ni de localStorage cote client : l'etat
                    "suis-je connecte / quel role" est determine via GET /api/auth/me
Propriétaire     : Josué BEDEL
Date de création : 27/08/2026
Date de mise à jour : 31/08/2026

*/

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/authApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    //  Restauration de session au chargement de l'app 
    // Le cookie httpOnly voyage automatiquement avec la requete si present et valide.
    const restaurerSession = useCallback(async () => {
        try {
            const response = await authApi.me()
            setUser(response.data)
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        restaurerSession()
    }, [restaurerSession])

    //  Connexion 
    // Le backend pose le cookie httpOnly via Set-Cookie ; on recupere juste
    // role/nom pour l'etat React (jamais le token, on ne le voit plus).
    async function login(email, password) {
        const response = await authApi.login(email, password)
        const { role, nom } = response.data

        const utilisateurConnecte = { email, role, nom }
        setUser(utilisateurConnecte)
        return utilisateurConnecte
    }

    //  Deconnexion 
    // Le backend doit effacer le cookie cote serveur (maxAge=0) - un simple
    // "oubli" cote client ne suffit plus puisque le JS ne peut pas le lire/supprimer.
    async function logout() {
        try {
            await authApi.logout()
        } finally {
            setUser(null)
        }
    }

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser: restaurerSession,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

//  Hook d'acces au contexte 
// A utiliser dans les composants a la place de useContext(AuthContext) directement ;
// leve une erreur explicite si utilise hors d'un AuthProvider (bug frequent sinon
// silencieux : contexte = null et destructuring qui plante plus loin).
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth doit etre utilise a l'interieur d'un AuthProvider")
    }
    return context
}