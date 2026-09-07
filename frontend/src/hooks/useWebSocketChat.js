/*

Nom du fichier   : useWebSocketChat.js
Objectif         : Connexion STOMP/SockJS au chat temps reel d'une intervention.
                    Envoie sur /app/intervention/{id}/chat, ecoute sur
                    /topic/intervention/{id} (voir ChatWebSocketController cote
                    backend). Auth via cookie httpOnly transmis a la poignee
                    de main SockJS (withCredentials).
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import { useCallback, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useWebSocketChat(idIntervention) {
    const [messages, setMessages] = useState([])
    const [connecte, setConnecte] = useState(false)
    const [erreur, setErreur] = useState('')
    const clientRef = useRef(null)

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
            },
            onDisconnect: () => setConnecte(false),
            onStompError: () => setErreur('Connexion au chat interrompue.'),
        })

        client.activate()
        clientRef.current = client

        return () => {
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

    return { messages, connecte, erreur, envoyerMessage }
}