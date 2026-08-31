/*

Nom du fichier   : axiosClient.js
Objectif         : Instance axios centralisée - intercepteur JWT sur chaque requête sortante, gestion automatique de l'expiration/invalidité du token (401) avec redirection vers /login
Propriétaire     : Josué BEDEL
Date de création : 27/08/2026

*/

import axios from 'axios'

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// --- Intercepteur de requete : ajoute le token JWT sur chaque appel -------
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// --- Intercepteur de reponse : gere l'expiration/invalidite du token -----
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expire ou invalide : on nettoie la session et on redirige
            // vers la page de connexion, sauf si on y est deja (evite une boucle).
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default axiosClient