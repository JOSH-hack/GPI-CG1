/*

Nom du fichier   : AuthContext.jsx
Objectif         : Contexte d'authentification global - login, logout, utilisateur courant, rôle, persistance dans localStorage, restauration de session au rechargement
Propriétaire     : Josué BEDEL
Date de création : 27/08/2026

*/

import { createContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { authApi } from '../api/authApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    //  Restauration de session au chargement de l'app --
    useEffect(() => {
        const token = localStorage.getItem('token')

        if (token) {
            try {
                const decoded = jwtDecode(token)
                const estExpire = decoded.exp * 1000 < Date.now()

                if (estExpire) {
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                } else {
                    const userStocke = JSON.parse(localStorage.getItem('user') || '{}')
                    setUser({
                        idUtilisateur: decoded.userId,
                        email: decoded.sub,
                        role: decoded.role,
                        nom: userStocke.nom || '',
                    })
                }
            } catch {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            }
        }

        setLoading(false)
    }, [])

    //  Connexion 
    async function login(email, password) {
        const response = await authApi.login(email, password)
        const { token, role, nom } = response.data

        const decoded = jwtDecode(token)
        const utilisateurConnecte = {
            idUtilisateur: decoded.userId,
            email: decoded.sub,
            role,
            nom,
        }

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(utilisateurConnecte))
        setUser(utilisateurConnecte)

        return utilisateurConnecte
    }

    //  Deconnexion 
    function logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}