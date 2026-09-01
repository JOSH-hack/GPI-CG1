/*

Nom du fichier   : axiosClient.js
Objectif         : Instance axios centralisee - withCredentials pour l'envoi automatique du cookie httpOnly de session, gestion de la deconnexion silencieuse sur 401
Propriétaire     : Josué BEDEL
Date de création : 27/08/2026
Date de mise à jour : 31/08/2026
Objet de mise à jour : Passage a l'authentification par cookie httpOnly - ajout de withCredentials, suppression de l'intercepteur Authorization Bearer et du nettoyage localStorage (plus de token cote client)

*/

import axios from 'axios'

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

// --- Intercepteur de reponse : gere l'expiration/invalidite de la session -----
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default axiosClient