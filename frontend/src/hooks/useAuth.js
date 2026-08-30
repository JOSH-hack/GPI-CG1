/*

Nom du fichier   : useAuth.js
Objectif         : Hook custom pour consommer AuthContext (user, login, logout, isAuthenticated) - évite d'importer useContext + AuthContext partout et lève une erreur claire si utilisé hors du AuthProvider
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026

*/

import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider')
    }

    return context
}