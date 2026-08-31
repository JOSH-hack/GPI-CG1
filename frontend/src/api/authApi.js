/*

Nom du fichier   : authApi.js
Objectif         : Appels API du module Authentification - login, inscription, vérification d'email par code
Propriétaire     : Josué BEDEL
Date de création : 27/08/2026
Date de mise à jour : 29/08/2026
Objet de mise à jour : Ajout de verifyEmail et resendCode (vérification d'email obligatoire à l'inscription)

*/

import axiosClient from './axiosClient'

export const authApi = {
    login: (email, password) => axiosClient.post('/auth/login', { email, password }),
    register: (data) => axiosClient.post('/auth/register', data),
    verifyEmail: (email, code) => axiosClient.post('/auth/verify-email', { email, code }),
    resendCode: (email) => axiosClient.post('/auth/resend-code', { email }),
}