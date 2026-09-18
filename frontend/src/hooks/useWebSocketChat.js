/*

Nom du fichier   : useWebSocketChat.js
Objectif         : Connexion STOMP/SockJS au chat temps reel d'une intervention.
                    Envoie sur /app/intervention/{id}/chat, ecoute sur
                    /topic/intervention/{id} (voir ChatWebSocketController cote
                    backend). Gere aussi l'indicateur "en train d'ecrire" via
                    /app/intervention/{id}/typing -> /topic/intervention/{id}/typing,
                    ephemere (non persiste). Auth via cookie httpOnly transmis a
                    la poignee de main SockJS (withCredentials).
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import { useCallback, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs.js'

const DELAI_EFFACEMENT_TYPING_MS = 3000
const DELAI_THROTTLE_TYPING_MS = 2000

export function useWebSocketChat(idIntervention) {
    const [messages, setMessages] = useState([])
    const [connecte, setConnecte] = useState(false)
    const [erreur, setErreur] = useState('')
    const [utilisateurEnTrainDecrire, setUtilisateurEnTrainDecrire] = useState(null)
    const clientRef = useRef(null)
    const dernierEnvoiTypingRef = useRef(0)
    const timeoutTypingRef = useRef(null)

    useEffect(() => {
        if (!idIntervention) return

        const client = new Client({
            webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_BASE_URL, null, { withCredentials: true }),
            reconnectDelay: 5000,
            onConnect: () => {
                setConnecte(true)
                setErreur('')
                client.subscribe(`/topic/intervention/${idIntervention}`, (frame) => {
                    const message = JSON.parse(frame.body)
                    setMessages((precedents) => [...precedents, message])
                })
                client.subscribe(`/topic/intervention/${idIntervention}/typing`, (frame) => {
                    const utilisateur = JSON.parse(frame.body)
                    setUtilisateurEnTrainDecrire(utilisateur)
                    clearTimeout(timeoutTypingRef.current)
                    timeoutTypingRef.current = setTimeout(
                        () => setUtilisateurEnTrainDecrire(null),
                        DELAI_EFFACEMENT_TYPING_MS
                    )
                })
            },
            onDisconnect: () => setConnecte(false),
            onStompError: () => setErreur('Connexion au chat interrompue.'),
        })

        client.activate()
        clientRef.current = client

        return () => {
            clearTimeout(timeoutTypingRef.current)
            client.deactivate()
            clientRef.current = null
        }
    }, [idIntervention])

    const envoyerMessage = useCallback(
        (contenu) => {
            if (!clientRef.current?.connected || !contenu.trim()) return
            clientRef.current.publish({
                destination: `/app/intervention/${idIntervention}/chat`,
                body: JSON.stringify({ contenu: contenu.trim() }),
            })
        },
        [idIntervention]
    )

    // Throttle : au plus un envoi toutes les DELAI_THROTTLE_TYPING_MS, pour ne
    // pas spammer le serveur a chaque frappe de touche.
    const notifierEnTrainDecrire = useCallback(() => {
        if (!clientRef.current?.connected) return
        const maintenant = Date.now()
        if (maintenant - dernierEnvoiTypingRef.current < DELAI_THROTTLE_TYPING_MS) return
        dernierEnvoiTypingRef.current = maintenant
        clientRef.current.publish({
            destination: `/app/intervention/${idIntervention}/typing`,
            body: '{}',
        })
    }, [idIntervention])

    return { messages, connecte, erreur, envoyerMessage, utilisateurEnTrainDecrire, notifierEnTrainDecrire }
}