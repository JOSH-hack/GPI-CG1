/*

Nom du fichier   : useSlowScroll.js
Objectif         : Intercepte le scroll (molette/trackpad) et l'anime plus lentement
                    qu'un scroll natif. Attention : remplace le scroll natif du
                    navigateur - peut gener certains utilisateurs (trackpad,
                    accessibilite). A utiliser avec parcimonie, jamais en cas
                    de doute sur l'accessibilite.
Propriétaire     : Josué BEDEL
Date de création : 01/09/2026

*/

import { useEffect, useRef } from 'react'

/**
 * @param {number} facteur - portion du deltaY appliquee par "tick" de molette
 *   (0.3 a 0.6 = nettement plus lent qu'un scroll natif ; 1 = vitesse normale)
 * @param {number} rattrapage - vitesse de rattrapage vers la cible a chaque frame
 *   (0.1 a 0.2 = doux ; proche de 1 = quasi instantane)
 * @param {boolean} actif - permet de desactiver le hook sans le retirer du composant
 */
export function useSlowScroll({ facteur = 0.5, rattrapage = 0.15, actif = true } = {}) {
    const cibleRef = useRef(0)
    const enCoursRef = useRef(false)

    useEffect(() => {
        if (!actif) return undefined

        cibleRef.current = window.scrollY

        function animer() {
            const actuel = window.scrollY
            const distance = cibleRef.current - actuel

            if (Math.abs(distance) < 0.5) {
                enCoursRef.current = false
                return
            }

            window.scrollTo(0, actuel + distance * rattrapage)
            requestAnimationFrame(animer)
        }

        function onWheel(event) {
            event.preventDefault()

            const maxScroll = document.documentElement.scrollHeight - window.innerHeight
            cibleRef.current = Math.max(
                0,
                Math.min(maxScroll, cibleRef.current + event.deltaY * facteur)
            )

            if (!enCoursRef.current) {
                enCoursRef.current = true
                requestAnimationFrame(animer)
            }
        }

        // { passive: false } obligatoire pour pouvoir appeler preventDefault()
        window.addEventListener('wheel', onWheel, { passive: false })
        return () => window.removeEventListener('wheel', onWheel)
    }, [facteur, rattrapage, actif])
}