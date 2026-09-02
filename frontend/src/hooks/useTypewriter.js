/*

Nom du fichier   : useTypewriter.js
Objectif         : Deux hooks reutilisables pour l'effet machine a ecrire - useTypewriter pour une frappe unique au montage, useTypewriterLoop pour un cycle infini (tape, pause, efface, phrase suivante) avec possibilite de forcer l'index depuis l'exterieur (ex: fleches de navigation)
Propriétaire     : Josué BEDEL
Date de création : 01/09/2026

*/

import { useEffect, useRef, useState } from 'react'

// Frappe unique, s'arrete a la fin - utilise pour le titre de la page d'accueil.
export function useTypewriter(texte, { vitesse = 30, delaiDepart = 0 } = {}) {
    const [texteAffiche, setTexteAffiche] = useState('')
    const [termine, setTermine] = useState(false)

    useEffect(() => {
        let indexCaractere = 0
        let identifiantTimeout

        function taperCaractereSuivant() {
            if (indexCaractere <= texte.length) {
                setTexteAffiche(texte.slice(0, indexCaractere))
                indexCaractere += 1
                identifiantTimeout = setTimeout(taperCaractereSuivant, vitesse)
            } else {
                setTermine(true)
            }
        }

        const identifiantDepart = setTimeout(taperCaractereSuivant, delaiDepart)

        return () => {
            clearTimeout(identifiantDepart)
            clearTimeout(identifiantTimeout)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [texte])

    return { texteAffiche, termine }
}

// Boucle infinie sur un tableau de phrases : tape, marque une pause, efface,
// passe a la phrase suivante, recommence indefiniment. setIndex permet de
// forcer une phrase depuis l'exterieur (ex: fleches precedent/suivant) sans
// casser le cycle - le minuteur repart proprement en phase "frappe".
export function useTypewriterLoop(
    phrases,
    { vitesseFrappe = 30, vitesseEffacement = 15, pauseApresFrappe = 2200, pauseApresEffacement = 300 } = {}
) {
    const [index, setIndexInterne] = useState(0)
    const [texteAffiche, setTexteAffiche] = useState('')
    const phaseRef = useRef('frappe')
    const positionRef = useRef(0)

    useEffect(() => {
        let identifiantTimeout

        function etape() {
            const phraseActuelle = phrases[index] || ''

            if (phaseRef.current === 'frappe') {
                positionRef.current += 1
                setTexteAffiche(phraseActuelle.slice(0, positionRef.current))

                if (positionRef.current >= phraseActuelle.length) {
                    phaseRef.current = 'pause-frappe'
                    identifiantTimeout = setTimeout(etape, pauseApresFrappe)
                } else {
                    identifiantTimeout = setTimeout(etape, vitesseFrappe)
                }
                return
            }

            if (phaseRef.current === 'pause-frappe') {
                phaseRef.current = 'effacement'
                identifiantTimeout = setTimeout(etape, vitesseEffacement)
                return
            }

            if (phaseRef.current === 'effacement') {
                positionRef.current -= 1
                setTexteAffiche(phraseActuelle.slice(0, positionRef.current))

                if (positionRef.current <= 0) {
                    phaseRef.current = 'pause-effacement'
                    identifiantTimeout = setTimeout(etape, pauseApresEffacement)
                } else {
                    identifiantTimeout = setTimeout(etape, vitesseEffacement)
                }
                return
            }

            if (phaseRef.current === 'pause-effacement') {
                phaseRef.current = 'frappe'
                positionRef.current = 0
                setIndexInterne((precedent) => (precedent + 1) % phrases.length)
            }
        }

        identifiantTimeout = setTimeout(etape, vitesseFrappe)

        return () => clearTimeout(identifiantTimeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, phrases])

    // Force une phrase precise (ex: clic sur une fleche) - reinitialise le
    // cycle proprement en phase "frappe" pour cette nouvelle phrase.
    function definirIndex(nouvelIndex) {
        phaseRef.current = 'frappe'
        positionRef.current = 0
        setTexteAffiche('')
        setIndexInterne(nouvelIndex)
    }

    return { texteAffiche, index, definirIndex }
}