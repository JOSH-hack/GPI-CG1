/*

Nom du fichier   : useMenuBadges.js
Objectif         : Calcule quels items du menu lateral doivent afficher un
                    point rouge de notification :
                    - Admin/DSI : "Interventions en attente" (>=1 en attente),
                      "Interventions" (nouvelle depuis derniere visite)
                    - Technicien : "Pannes" (nouvelle panne active depuis
                      derniere visite), "Interventions" (nouvelle depuis
                      derniere visite)
                    - Agent : "Mon Materiel" (nouvel equipement recu depuis
                      derniere visite), "Mes Signalements" (statut d'une panne
                      change depuis derniere visite - ex: prise en charge)
                    Rafraichissement automatique toutes les 45s en plus du
                    chargement au montage, pour detecter les nouveautes sans
                    avoir a naviguer.
Propriétaire     : Josué BEDEL
Date de création : 14/09/2026
Date de mise à jour : 18/09/2026
Objet de mise à jour : Ajout des badges cote Technicien (pannes, interventions)
                        et rafraichissement automatique periodique

*/

import { useEffect, useState } from 'react'
import { interventionApi } from '../api/interventionApi'
import { equipementApi } from '../api/equipementApi'
import { panneApi } from '../api/panneApi'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../utils/constants'

const CLE_DERNIER_VU_INTERVENTIONS = 'gpi_dernier_vu_interventions'
const CLE_EQUIPEMENTS_VUS = 'gpi_equipements_vus'
const CLE_STATUTS_PANNES_VUS = 'gpi_statuts_pannes_vus'
const CLE_PANNES_VUES_TECHNICIEN = 'gpi_pannes_vues_technicien'

const INTERVALLE_RAFRAICHISSEMENT_MS = 45_000

export function marquerInterventionsCommeVues() {
    localStorage.setItem(CLE_DERNIER_VU_INTERVENTIONS, new Date().toISOString())
}

export function marquerEquipementsCommeVus(equipements) {
    const ids = equipements.map((e) => e.idEquipement)
    localStorage.setItem(CLE_EQUIPEMENTS_VUS, JSON.stringify(ids))
}

export function marquerStatutsPannesCommeVus(pannes) {
    const statuts = Object.fromEntries(pannes.map((p) => [p.idPanne, p.statut]))
    localStorage.setItem(CLE_STATUTS_PANNES_VUS, JSON.stringify(statuts))
}

export function marquerPannesCommeVuesTechnicien(pannes) {
    const ids = pannes.map((p) => p.idPanne)
    localStorage.setItem(CLE_PANNES_VUES_TECHNICIEN, JSON.stringify(ids))
}

export function useMenuBadges() {
    const { user } = useAuth()
    const [badges, setBadges] = useState({})

    useEffect(() => {
        if (!user?.role) return
        let annule = false

        async function chargerAdminDsi() {
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

        async function chargerTechnicien() {
            try {
                const [resPannes, resInterventions] = await Promise.all([
                    panneApi.listerActives(),
                    interventionApi.listerToutes(),
                ])
                if (annule) return

                const idsPannesVues = JSON.parse(localStorage.getItem(CLE_PANNES_VUES_TECHNICIEN) || '[]')
                const nouvellePanne = resPannes.data.some((p) => !idsPannesVues.includes(p.idPanne))

                const dernierVu = localStorage.getItem(CLE_DERNIER_VU_INTERVENTIONS)
                const dateReference = dernierVu ? new Date(dernierVu) : null
                const aDesNouvellesInterventions = resInterventions.data.some(
                    (i) => i.dateIntervention && (!dateReference || new Date(i.dateIntervention) > dateReference)
                )

                setBadges({
                    '/assistance/pannes': nouvellePanne,
                    '/assistance/interventions': aDesNouvellesInterventions,
                })
            } catch {
                // Echec silencieux
            }
        }

        async function chargerAgent() {
            try {
                const [resEquipements, resPannes] = await Promise.all([
                    equipementApi.monMateriel(),
                    panneApi.mesSignalements(),
                ])
                if (annule) return

                const idsVus = JSON.parse(localStorage.getItem(CLE_EQUIPEMENTS_VUS) || '[]')
                const nouvelEquipement = resEquipements.data.some((e) => !idsVus.includes(e.idEquipement))

                const statutsVus = JSON.parse(localStorage.getItem(CLE_STATUTS_PANNES_VUS) || '{}')
                const statutPanneChange = resPannes.data.some(
                    (p) => statutsVus[p.idPanne] !== undefined && statutsVus[p.idPanne] !== p.statut
                )
                // Un signalement jamais vu auparavant compte aussi comme nouveaute
                const nouveauSignalement = resPannes.data.some((p) => statutsVus[p.idPanne] === undefined)

                setBadges({
                    '/mon-materiel': nouvelEquipement,
                    '/assistance/mes-signalements': statutPanneChange || nouveauSignalement,
                })
            } catch {
                // Echec silencieux
            }
        }

        function chargerSelonRole() {
            if (user.role === ROLES.ADMIN_INFO || user.role === ROLES.ADMIN_SYSTEME || user.role === ROLES.RESPONSABLE_DSI) {
                chargerAdminDsi()
            } else if (user.role === ROLES.TECHNICIEN) {
                chargerTechnicien()
            } else if (user.role === ROLES.AGENT) {
                chargerAgent()
            }
        }

        chargerSelonRole()
        const intervalle = setInterval(chargerSelonRole, INTERVALLE_RAFRAICHISSEMENT_MS)

        return () => {
            annule = true
            clearInterval(intervalle)
        }
    }, [user?.role])

    return badges
}