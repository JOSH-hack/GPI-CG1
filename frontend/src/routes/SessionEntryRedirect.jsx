/*

Nom du fichier   : SessionEntryRedirect.jsx
Objectif         : Force le retour a la page d'accueil ("/") au tout premier
                    chargement d'une nouvelle session de navigateur (onglet
                    ferme puis rouvert), meme si l'URL chargee au demarrage
                    est une autre route. N'agit qu'une seule fois par session
                    (sessionStorage) : les rechargements/navigations suivants
                    dans le meme onglet ne sont pas affectes.
Propriétaire     : Josué BEDEL
Date de création : 18/09/2026

*/

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const CLE_SESSION = 'gpi_session_demarree'

export default function SessionEntryRedirect() {
    const navigate = useNavigate()
    const dejaTraite = useRef(false)

    useEffect(() => {
        if (dejaTraite.current) return
        dejaTraite.current = true

        const sessionDejaDemarree = sessionStorage.getItem(CLE_SESSION)

        if (!sessionDejaDemarree) {
            sessionStorage.setItem(CLE_SESSION, 'true')
            if (window.location.pathname !== '/') {
                navigate('/', { replace: true })
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return null
}