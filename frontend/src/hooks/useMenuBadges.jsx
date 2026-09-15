/*

Nom du fichier   : useMenuBadges.js
Objectif         : Calcule quels items du menu lateral doivent afficher un
                    point rouge de notification - "Interventions en attente"
                    (des lors qu'il y en a au moins une) et "Interventions"
                    (des lors qu'une intervention a ete creee depuis la
                    derniere visite de cette page, trace en localStorage)
Propriétaire     : Josué BEDEL
Date de création : 14/09/2026

*/

import { useEffect, useState } from 'react'
import { interventionApi } from '../api/interventionApi'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../utils/constants'

const CLE_DERNIER_VU_INTERVENTIONS = 'gpi_dernier_vu_interventions'

export function marquerInterventionsCommeVues() {
    localStorage.setItem(CLE_DERNIER_VU_INTERVENTIONS, new Date().toISOString())
}

export function useMenuBadges() {
    const { user } = useAuth()
    const [badges, setBadges] = useState({})

    useEffect(() => {
        const estAdminOuDsi =
            user?.role === ROLES.ADMIN_INFO || user?.role === ROLES.ADMIN_SYSTEME || user?.role === ROLES.RESPONSABLE_DSI
        if (!estAdminOuDsi) return

        let annule = false

        async function charger() {
            try {
                const [resEnAttente, resToutes] = await Promise.all([
                    interventionApi.listerEnAttenteDsi(),
                    interventionApi.listerToutes(),
                ])
                if (annule) return

                const dernierVu = localStorage.getItem(CLE_DERNIER_VU_INTERVENTIONS)
                const dateReference = dernierVu ? new Date(dernierVu) : null
                const aDesNouvelles = resToutes.data.some(
                    (i) => i.dateIntervention && (!dateReference || new Date(i.dateIntervention) > dateReference)
                )

                setBadges({
                    '/assistance/interventions/en-attente-dsi': resEnAttente.data.length > 0,
                    '/assistance/interventions': aDesNouvelles,
                })
            } catch {
                // Echec silencieux : pas de badge affiche plutot que de casser le menu
            }
        }

        charger()
        return () => {
            annule = true
        }
    }, [user?.role])

    return badges
}