/*

Nom du fichier   : authApi.js
Objectif         : Appels API du module Authentification - login et inscription
Propriétaire     : Josué BEDEL
Date de création : 27/08/2026

*/

import axiosClient from './axiosClient'

export const authApi = {
    login: (email, password) => axiosClient.post('/auth/login', { email, password }),
    register: (data) => axiosClient.post('/auth/register', data),
}