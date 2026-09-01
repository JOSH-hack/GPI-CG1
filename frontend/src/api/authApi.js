/*

Nom du fichier   : authApi.js
Objectif         : Appels API du module Authentification - login, inscription, verification d'email, session par cookie httpOnly (me, logout)
Propriétaire     : Josué BEDEL
Date de création : 27/08/2026
Date de mise à jour : 31/08/2026
Objet de mise à jour : Ajout de me() et logout() pour la gestion de session par cookie httpOnly

*/

import axiosClient from './axiosClient'

export const authApi = {
    login: (email, password) => axiosClient.post('/auth/login', { email, password }),
    register: (data) => axiosClient.post('/auth/register', data),
    verifyEmail: (email, code) => axiosClient.post('/auth/verify-email', { email, code }),
    resendCode: (email) => axiosClient.post('/auth/resend-code', { email }),
    me: () => axiosClient.get('/auth/me'),
    logout: () => axiosClient.post('/auth/logout'),
}