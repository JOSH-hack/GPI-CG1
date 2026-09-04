/*

Nom du fichier   : Dashboard.jsx
Objectif         : Espace Agent apres connexion - materiel attribue, formulaire de
                    signalement de panne, signalements recents. Sidebar + Navbar
                    desormais fournis par DashboardLayout (voir components/layout/).
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026
Date de mise à jour : 02/09/2026
Objet de mise à jour : Retrait du sidebar/header duplique (deplace vers DashboardLayout / Sidebar.jsx / Navbar.jsx)

*/

import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { keyframes } from '@emotion/react'
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined'
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'
import EngineeringOutlined from '@mui/icons-material/EngineeringOutlined'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined'
import TaskAlt from '@mui/icons-material/TaskAlt'
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined'
import { panneApi } from '../../api/panneApi'
import { interventionApi } from '../../api/interventionApi'
import {
  STATUT_PANNE,
  PRIORITE_PANNE,
  PRIORITE_PANNE_LABELS,
  TYPE_INTERVENTION,
  TYPE_INTERVENTION_LABELS,
  ROLES,
  STATUT_EQUIPEMENT,
  TYPE_CATEGORIE_LABELS
} from '../../utils/constants'

import backgroundPic from '../../assets/background/backgroundpic.png'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import { useAuth } from '../../contexts/AuthContext'
import { equipementApi } from '../../api/equipementApi'

function formaterDate(valeur) {
  if (!valeur) return '—'
  return new Date(valeur).toLocaleDateString('fr-FR')
}

function libelleEquipement(equipement) {
  if (!equipement) return '—'
  const marqueModele = [equipement.marque, equipement.modele].filter(Boolean).join(' ')
  return marqueModele || equipement.nom || 'Équipement'
}

function typeEquipement(equipement) {
  const type = equipement?.categorie?.type
  return TYPE_CATEGORIE_LABELS[type] || equipement?.categorie?.libelle || '—'
}

function numeroTicket(panne) {
  const annee = panne.dateSurvenance ? new Date(panne.dateSurvenance).getFullYear() : new Date().getFullYear()
  return `TK-${annee}-${String(panne.idPanne).padStart(4, '0')}`
}

function etatEquipement(statut) {
  if (statut === STATUT_EQUIPEMENT.EN_PANNE) {
    return { label: 'En panne', color: '#dc5e60', prefix: '⚠' }
  }
  if (statut === STATUT_EQUIPEMENT.EN_SERVICE) {
    return { label: 'Fonctionnel', color: '#1b7548', prefix: '✔' }
  }
  if (statut === STATUT_EQUIPEMENT.EN_STOCK) {
    return { label: 'En stock', color: '#0c5d7d', prefix: '' }
  }
  return { label: 'Mis au rebut', color: '#9CA3AF', prefix: '' }
}

function statutTicket(statut) {
  if (statut === STATUT_PANNE.SIGNALEE) {
    return { label: 'En attente', bgcolor: '#dc5e60' }
  }
  if (statut === STATUT_PANNE.EN_COURS_TRAITEMENT) {
    return { label: 'En cours', bgcolor: '#e6a817' }
  }
  if (statut === STATUT_PANNE.REPAREE) {
    return { label: 'Résolu', bgcolor: '#1b7548' }
  }
  return { label: 'Réformé', bgcolor: '#9CA3AF' }
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontFamily: 'Quicksand, sans-serif',
    bgcolor: '#fff',
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Quicksand, sans-serif',
    color: '#0c5d7d',
    fontWeight: 600,
  },
}

function KpiCard({ valeur, label }) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 160,
        px: 2.5,
        py: 2,
        borderRadius: '12px',
        bgcolor: '#fff',
        boxShadow: '0 4px 12px rgba(12, 93, 125, 0.12)',
      }}
    >
      <Typography sx={{ color: '#0c5d7d', fontSize: 36, fontWeight: 700, lineHeight: 1, fontFamily: 'Quicksand, sans-serif' }}>
        {valeur}
      </Typography>
      <Typography sx={{ color: '#5C6B64', fontSize: 14, fontWeight: 600, mt: 0.75, fontFamily: 'Quicksand, sans-serif' }}>
        {label}
      </Typography>
    </Paper>
  )
}

const apparition = keyframes`
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1); }
`

const cardSxTechnicien = { border: '3px solid #1b7548', borderRadius: '10px', boxShadow: 'none' }

const COULEURS_PRIORITE_DASHBOARD = {
  [PRIORITE_PANNE.FAIBLE]: '#10b981',
  [PRIORITE_PANNE.MOYENNE]: '#f59e0b',
  [PRIORITE_PANNE.ELEVEE]: '#f97316',
  [PRIORITE_PANNE.CRITIQUE]: '#ef4444',
}

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function MetricCard({ value, label, Icon, backgroundColor, iconBackgroundColor, iconColor, compact = false }) {
  return (
    <Paper elevation={0} sx={{ ...cardSxTechnicien, bgcolor: backgroundColor, minWidth: 0, p: compact ? 1.25 : 1.5, flex: 1 }}>
      <Stack spacing={compact ? 0.5 : 0.75}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ color: '#1f2937', fontFamily: 'Quicksand, sans-serif', fontSize: compact ? 23 : 27, fontWeight: 700, lineHeight: 1 }}>
            {value}
          </Typography>
          <Box sx={{ alignItems: 'center', bgcolor: iconBackgroundColor, borderRadius: '50%', display: 'flex', height: compact ? 27 : 31, justifyContent: 'center', width: compact ? 27 : 31 }}>
            <Icon sx={{ color: iconColor, fontSize: compact ? 16 : 18 }} />
          </Box>
        </Stack>
        <Typography sx={{ color: '#6b7280', fontFamily: 'Quicksand, sans-serif', fontSize: compact ? 9 : 10, fontWeight: 600, lineHeight: 1.2 }}>
          {label}
        </Typography>
      </Stack>
    </Paper>
  )
}

function DonutChart({ total, gradient, anime }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        borderRadius: '50%',
        display: 'flex',
        height: 94,
        justifyContent: 'center',
        position: 'relative',
        width: 94,
        background: gradient,
        animation: anime ? `${apparition} 0.6s ease-out` : 'none',
        transition: 'background 0.8s ease',
      }}
    >
      <Stack alignItems="center" spacing={0} sx={{ bgcolor: '#f9fafb', borderRadius: '50%', height: 48, width: 48, justifyContent: 'center' }}>
        <Typography sx={{ color: '#1f2937', fontFamily: 'Quicksand, sans-serif', fontSize: 14, fontWeight: 700, lineHeight: 1 }}>
          {total}
        </Typography>
        <Typography sx={{ color: '#6b7280', fontFamily: 'Quicksand, sans-serif', fontSize: 7, fontWeight: 500, lineHeight: 1.2 }}>
          Total
        </Typography>
      </Stack>
    </Box>
  )
}

function BreakdownCard({ title, total, gradient, items, anime }) {
  return (
    <Paper elevation={0} sx={{ ...cardSxTechnicien, bgcolor: '#f9fafb', flex: '1 1 0', minWidth: 220, p: 1.5 }}>
      <Stack spacing={1.5}>
        <Typography sx={{ color: '#1f2937', fontFamily: 'Quicksand, sans-serif', fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <DonutChart total={total} gradient={gradient} anime={anime} />
        </Box>
        <Stack spacing={0.5}>
          {items.map((item) => (
            <Stack key={item.label} direction="row" alignItems="center" spacing={0.75}>
              <Box sx={{ bgcolor: item.color, borderRadius: '50%', height: 7, width: 7 }} />
              <Typography sx={{ color: '#374151', flex: 1, fontFamily: 'Quicksand, sans-serif', fontSize: 9, fontWeight: 500, lineHeight: 1.1 }}>
                {item.label}
              </Typography>
              <Typography sx={{ color: '#1f2937', fontFamily: 'Quicksand, sans-serif', fontSize: 9, fontWeight: 700, lineHeight: 1.1 }}>
                {item.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  )
}

function construireGradient(items, total) {
  if (!total) return 'conic-gradient(#e5e7eb 0deg 360deg)'
  let angleActuel = 0
  const segments = items.map((item) => {
    const angle = (item.value / total) * 360
    const segment = `${item.color} ${angleActuel}deg ${angleActuel + angle}deg`
    angleActuel += angle
    return segment
  })
  return `conic-gradient(${segments.join(', ')})`
}

function EspaceTechnicienContent() {
  const { user } = useAuth()
  const [pannes, setPannes] = useState([])
  const [interventions, setInterventions] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [anime, setAnime] = useState(false)

  useEffect(() => {
    async function charger() {
      setChargement(true)
      setErreur('')
      try {
        const statuts = Object.values(STATUT_PANNE)
        const [reponsesParStatut, reponseInterventions] = await Promise.all([
          Promise.all(statuts.map((statut) => panneApi.listerParStatut(statut))),
          interventionApi.listerToutes(),
        ])
        setPannes(reponsesParStatut.flatMap((r) => r.data))
        setInterventions(reponseInterventions.data)
      } catch {
        setErreur('Impossible de charger le tableau de bord.')
      } finally {
        setChargement(false)
        // Declenche l'animation d'entree une fois les vraies donnees en place
        requestAnimationFrame(() => setAnime(true))
      }
    }
    charger()
  }, [])

  const maintenant = new Date()
  const aujourdhui = maintenant.toDateString()

  const mesInterventions = interventions.filter((i) => i.technicien?.idUtilisateur === user?.idUtilisateur)

  const pannesCritiques = pannes.filter(
    (p) => p.priorite === PRIORITE_PANNE.CRITIQUE && p.statut !== STATUT_PANNE.REPAREE && p.statut !== STATUT_PANNE.REFORMEE
  ).length

  const mesInterventionsAValider = mesInterventions.filter((i) => i.rapport && !i.dateValidationDsi).length
  const rapportsEnAttenteGlobal = interventions.filter((i) => i.rapport && !i.dateValidationDsi).length

  const interventionsDuJour = interventions.filter(
    (i) => i.dateIntervention && new Date(i.dateIntervention).toDateString() === aujourdhui
  ).length
  const interventionsEnCours = interventions.filter((i) => !i.dateResolution).length
  const panneesRepareesCeMois = pannes.filter((p) => {
    if (p.statut !== STATUT_PANNE.REPAREE || !p.dateSurvenance) return false
    const date = new Date(p.dateSurvenance)
    return date.getMonth() === maintenant.getMonth() && date.getFullYear() === maintenant.getFullYear()
  }).length

  const parPriorite = Object.values(PRIORITE_PANNE).map((valeur) => ({
    label: PRIORITE_PANNE_LABELS[valeur],
    value: pannes.filter((p) => p.priorite === valeur).length,
    color: COULEURS_PRIORITE_DASHBOARD[valeur],
  }))

  const parType = Object.values(TYPE_INTERVENTION).map((valeur, index) => ({
    label: TYPE_INTERVENTION_LABELS[valeur],
    value: interventions.filter((i) => i.typeIntervention === valeur).length,
    color: index === 0 ? '#0f9f95' : '#f97316',
  }))

  const couleursCategories = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#ec4899']
  const categoriesMap = {}
  pannes.forEach((p) => {
    const libelle = p.equipement?.categorie?.libelle || 'Autre'
    categoriesMap[libelle] = (categoriesMap[libelle] || 0) + 1
  })
  const parCategorie = Object.entries(categoriesMap).map(([label, value], index) => ({
    label,
    value,
    color: couleursCategories[index % couleursCategories.length],
  }))

  // Evolution sur les 12 derniers mois
  const chartMonths = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - (11 - i), 1)
    const pannesDuMois = pannes.filter((p) => {
      if (!p.dateSurvenance) return false
      const d = new Date(p.dateSurvenance)
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
    })
    return {
      label: MOIS_LABELS[date.getMonth()],
      signalees: pannesDuMois.length,
      enCours: pannesDuMois.filter((p) => p.statut === STATUT_PANNE.EN_COURS_TRAITEMENT).length,
      reparees: pannesDuMois.filter((p) => p.statut === STATUT_PANNE.REPAREE).length,
      reformees: pannesDuMois.filter((p) => p.statut === STATUT_PANNE.REFORMEE).length,
    }
  })
  const maxValeurChart = Math.max(1, ...chartMonths.map((m) => m.signalees))
  const echelleY = [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => Math.round(maxValeurChart * f)).reverse()

  if (chargement) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      component="section"
      aria-labelledby="assistance-dashboard-title"
      sx={{ boxSizing: 'border-box', maxWidth: 1500, p: { xs: 2, sm: 2.5 }, width: '100%', maxheight: 100, }}
    >
      {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}
      <Stack spacing={1.75}>
        <Box component="header">
          <Typography id="assistance-dashboard-title" sx={{ color: '#1f2937', fontFamily: 'Quicksand, sans-serif', fontSize: { xs: 21, sm: 24 }, fontWeight: 700, lineHeight: 1.2 }}>
            Tableau de bord - Assistance
          </Typography>
          <Box sx={{ bgcolor: '#1b7548', height: 3, mt: 0.5, width: 242 }} />
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.75} sx={{ minHeight: { md: 240 } }}>
          <Stack spacing={1.25} sx={{ flex: { md: '0 0 164px' } }}>
            <MetricCard value={pannes.length} label="Pannes signalées" Icon={WarningAmberOutlined} backgroundColor="#edfdf7" iconBackgroundColor="#d7f8e9" iconColor="#10b981" />
            <MetricCard value={pannesCritiques} label="Pannes critiques" Icon={ErrorOutline} backgroundColor="#fff3f3" iconBackgroundColor="#ffe0e2" iconColor="#ef4444" />
            <MetricCard value={mesInterventionsAValider} label="Mes interventions à valider" Icon={TaskAlt} backgroundColor="#edfdf7" iconBackgroundColor="#d7f8e9" iconColor="#10b981" />
          </Stack>

          <Paper elevation={0} sx={{ ...cardSxTechnicien, bgcolor: '#f9fafb', flex: 1, minHeight: 240, p: 1.5 }}>
            <Stack spacing={1} sx={{ height: '100%' }}>
              <Typography sx={{ color: '#1f2937', fontFamily: 'Quicksand, sans-serif', fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>
                Évolution des pannes signalées
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                {[
                  { label: 'Signalées', color: '#10b981' },
                  { label: 'En cours', color: '#f97316' },
                  { label: 'Réparées', color: '#3b82f6' },
                  { label: 'Réformées', color: '#ef4444' },
                ].map((item) => (
                  <Stack key={item.label} direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ bgcolor: item.color, borderRadius: '50%', height: 6, width: 6 }} />
                    <Typography sx={{ color: '#4b5563', fontFamily: 'Quicksand, sans-serif', fontSize: 8, fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Stack direction="row" spacing={0.75} sx={{ flex: 1, minHeight: 160 }}>
                <Stack justifyContent="space-between" sx={{ height: 145, pb: 1.5 }}>
                  {echelleY.map((valeur, i) => (
                    <Typography key={i} sx={{ color: '#9ca3af', fontFamily: 'Quicksand, sans-serif', fontSize: 7, lineHeight: 1 }}>
                      {valeur}
                    </Typography>
                  ))}
                </Stack>
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      alignItems: 'flex-end',
                      backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, #e5e7eb 28px, transparent 29px)',
                      display: 'flex',
                      flex: 1,
                      gap: { xs: 0.5, sm: 1 },
                      minHeight: 145,
                      px: 0.75,
                    }}
                  >
                    {chartMonths.map((mois, index) => {
                      const hauteurBarre = anime ? (mois.signalees / maxValeurChart) * 140 : 0
                      return (
                        <Box key={`${mois.label}-${index}`} sx={{ alignItems: 'center', display: 'flex', flex: 1, height: '100%', justifyContent: 'flex-end', minWidth: 8, position: 'relative' }}>
                          <Box
                            sx={{
                              bgcolor: '#a8d4c9',
                              height: `${hauteurBarre}px`,
                              opacity: 0.95,
                              width: { xs: 7, sm: 10 },
                              transition: `height 0.7s ease ${index * 0.04}s`,
                            }}
                          />
                        </Box>
                      )
                    })}
                  </Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.25 }}>
                    {chartMonths.map((mois, index) => (
                      <Typography key={`${mois.label}-label-${index}`} sx={{ color: '#9ca3af', fontFamily: 'Quicksand, sans-serif', fontSize: 7, lineHeight: 1 }}>
                        {mois.label}
                      </Typography>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <MetricCard value={interventionsDuJour} label="Interventions du jour" Icon={CalendarTodayOutlined} backgroundColor="#effcfb" iconBackgroundColor="#cff5f1" iconColor="#0f9f95" compact />
          <MetricCard value={interventionsEnCours} label="Interventions en cours" Icon={EngineeringOutlined} backgroundColor="#fff7ed" iconBackgroundColor="#ffedd5" iconColor="#f97316" compact />
          <MetricCard value={panneesRepareesCeMois} label="Pannes réparées ce mois" Icon={FactCheckOutlined} backgroundColor="#edfdf7" iconBackgroundColor="#d7f8e9" iconColor="#10b981" compact />
          <MetricCard value={rapportsEnAttenteGlobal} label="Rapports en attente de validation" Icon={DescriptionOutlined} backgroundColor="#fffdeb" iconBackgroundColor="#fef3c7" iconColor="#d99a00" compact />
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={1.75}>
          <BreakdownCard title="Pannes par priorité" total={pannes.length} gradient={construireGradient(parPriorite, pannes.length)} items={parPriorite} anime={anime} />
          <BreakdownCard title="Interventions par type" total={interventions.length} gradient={construireGradient(parType, interventions.length)} items={parType} anime={anime} />
          <BreakdownCard title="Pannes par catégorie" total={pannes.length} gradient={construireGradient(parCategorie, pannes.length)} items={parCategorie} anime={anime} />
        </Stack>
      </Stack>
    </Box>
  )
}
function EspaceAgentContent() {
  const { user } = useAuth()
  const [equipements, setEquipements] = useState([])
  const [signalements, setSignalements] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [idEquipement, setIdEquipement] = useState('')
  const [description, setDescription] = useState('')
  const [priorite, setPriorite] = useState(PRIORITE_PANNE.MOYENNE)

  async function chargerDonnees() {
    setErreur('')
    setChargement(true)
    try {
      const [reponseMateriel, reponsePannes] = await Promise.all([
        equipementApi.monMateriel(),
        panneApi.mesSignalements(),
      ])
      const listeEquipements = reponseMateriel.data || []
      const listePannes = reponsePannes.data || []
      setEquipements(listeEquipements)
      setSignalements(listePannes)
      if (listeEquipements.length > 0) {
        setIdEquipement((actuel) => actuel || String(listeEquipements[0].idEquipement))
      }
    } catch {
      setErreur('Impossible de charger votre espace. Vérifiez que le backend est démarré.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    chargerDonnees()
  }, [])

  const equipementSelectionne = useMemo(
    () => equipements.find((item) => String(item.idEquipement) === String(idEquipement)),
    [equipements, idEquipement]
  )

  const kpis = useMemo(() => {
    const maintenant = new Date()
    const resolusCeMois = signalements.filter((panne) => {
      if (panne.statut !== STATUT_PANNE.REPAREE || !panne.dateSurvenance) return false
      const date = new Date(panne.dateSurvenance)
      return date.getMonth() === maintenant.getMonth() && date.getFullYear() === maintenant.getFullYear()
    }).length
    const pannesEnCours = signalements.filter(
      (panne) => panne.statut === STATUT_PANNE.SIGNALEE || panne.statut === STATUT_PANNE.EN_COURS_TRAITEMENT
    ).length

    return {
      attribues: equipements.length,
      enCours: pannesEnCours,
      soumis: signalements.length,
      resolus: resolusCeMois,
    }
  }, [equipements, signalements])

  const recents = useMemo(
    () =>
      [...signalements]
        .sort((a, b) => new Date(b.dateSurvenance || 0) - new Date(a.dateSurvenance || 0))
        .slice(0, 3),
    [signalements]
  )

  async function handleSignaler(event) {
    event.preventDefault()
    setErreur('')
    setSucces('')
    if (!idEquipement || !description.trim()) {
      setErreur('Choisissez un équipement et décrivez le problème.')
      return
    }
    setEnvoi(true)
    try {
      await panneApi.signaler({
        idEquipement: Number(idEquipement),
        description: description.trim(),
        priorite,
      })
      setDescription('')
      setPriorite(PRIORITE_PANNE.MOYENNE)
      setSucces('Signalement envoyé. Le service informatique va le prendre en charge.')
      await chargerDonnees()
    } catch (error) {
      const message = error.response?.data?.message
      setErreur(message || 'Le signalement n’a pas pu être envoyé.')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        backgroundImage: `linear-gradient(
          rgba(204, 204, 204, 0.55),
          rgba(201, 201, 201, 0.75)
        ), url(${backgroundPic})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        px: { xs: 1.5, sm: 3 },
        pt: 2.5,
        pb: 3,
        fontFamily: 'Quicksand, sans-serif',
        boxSizing: 'border-box',
        flex: 1,
      }}
    >
      <Typography sx={{ color: '#0c5d7d', fontSize: { xs: 22, md: 28 }, fontWeight: 700, lineHeight: 1.2 }}>
        Espace Agent — Bienvenue, {user?.nom || '…'}
      </Typography>
      <Typography sx={{ color: '#5C6B64', fontSize: 15, fontWeight: 500, mt: 0.5, mb: 2.5 }}>
        Votre espace personnel de gestion et de suivi du matériel informatique.
      </Typography>

      {erreur && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErreur('')}>
          {erreur}
        </Alert>
      )}
      {succes && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSucces('')}>
          {succes}
        </Alert>
      )}

      {chargement ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <KpiCard valeur={kpis.attribues} label="Équipements attribués" />
            <KpiCard valeur={kpis.enCours} label="Panne en cours" />
            <KpiCard valeur={kpis.soumis} label="Signalements soumis" />
            <KpiCard valeur={kpis.resolus} label="Résolus ce mois" />
          </Stack>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="stretch">
            <Paper
              elevation={0}
              sx={{
                flex: 1.4,
                p: 2,
                borderRadius: '12px',
                bgcolor: '#fff',
                boxShadow: '0 4px 12px rgba(12, 93, 125, 0.12)',
                minWidth: 0,
              }}
            >
              <Typography sx={{ color: '#0c5d7d', fontSize: 20, fontWeight: 700, mb: 1.5 }}>
                Mon Matériel Attribué
              </Typography>
              <TableContainer sx={{ border: '2px solid #146f42', borderRadius: '9px', overflowX: 'auto' }}>
                <Table
                  size="small"
                  aria-label="Matériel attribué"
                  sx={{
                    minWidth: 640,
                    '& .MuiTableCell-root': {
                      borderBottom: 'none',
                      color: '#0c5d7d',
                      fontFamily: 'Quicksand, sans-serif',
                    },
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#0c5d7d', height: 38 }}>
                      {['Équipement', 'Marque / Modèle', 'N° Série', 'État', "Date d'attribution"].map((colonne) => (
                        <TableCell
                          key={colonne}
                          sx={{ px: 1.5, py: 0.75, color: '#fff !important', fontSize: 15, fontWeight: 700 }}
                        >
                          {colonne}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equipements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          Aucun matériel ne vous est encore attribué.
                        </TableCell>
                      </TableRow>
                    ) : (
                      equipements.map((equipement, index) => {
                        const etat = etatEquipement(equipement.statut)
                        return (
                          <TableRow
                            key={equipement.idEquipement}
                            hover
                            onClick={() => setIdEquipement(String(equipement.idEquipement))}
                            sx={{
                              height: 44,
                              cursor: 'pointer',
                              bgcolor:
                                String(equipement.idEquipement) === String(idEquipement)
                                  ? 'rgba(12, 93, 125, 0.08)'
                                  : index % 2 === 0
                                    ? '#fff'
                                    : '#f3f4f6',
                            }}
                          >
                            <TableCell sx={{ px: 1.5, fontWeight: 700 }}>{equipement.nom || '—'}</TableCell>
                            <TableCell sx={{ px: 1.5 }}>{libelleEquipement(equipement)}</TableCell>
                            <TableCell sx={{ px: 1.5 }}>{equipement.numeroSerie || '—'}</TableCell>
                            <TableCell sx={{ px: 1.5 }}>
                              <Chip
                                label={`${etat.prefix ? `${etat.prefix} ` : ''}${etat.label}`}
                                size="small"
                                sx={{
                                  height: 22,
                                  bgcolor: etat.color,
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontFamily: 'Quicksand, sans-serif',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ px: 1.5 }}>{formaterDate(equipement.dateAcquisition)}</TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper
              component="form"
              onSubmit={handleSignaler}
              elevation={0}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: '12px',
                bgcolor: '#fff',
                boxShadow: '0 4px 12px rgba(12, 93, 125, 0.12)',
                minWidth: { lg: 320 },
              }}
            >
              <Typography sx={{ color: '#0c5d7d', fontSize: 20, fontWeight: 700, mb: 1.5 }}>
                Signaler une Panne
              </Typography>

              <FormControl fullWidth size="small" sx={{ mb: 1.5, ...fieldSx }}>
                <Typography sx={{ color: '#0c5d7d', fontSize: 13, fontWeight: 700, mb: 0.5 }}>
                  Équipement concerné
                </Typography>
                <Select
                  value={idEquipement}
                  displayEmpty
                  onChange={(event) => setIdEquipement(event.target.value)}
                >
                  <MenuItem value="">Choisir un équipement</MenuItem>
                  {equipements.map((equipement) => (
                    <MenuItem key={equipement.idEquipement} value={String(equipement.idEquipement)}>
                      {libelleEquipement(equipement)} ({equipement.nom || typeEquipement(equipement)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                label="Type de panne"
                value={typeEquipement(equipementSelectionne)}
                InputProps={{ readOnly: true }}
                sx={{ mb: 1.5, ...fieldSx }}
              />

              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Description du problème"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                sx={{ mb: 1.5, ...fieldSx }}
              />

              <Typography sx={{ color: '#0c5d7d', fontSize: 13, fontWeight: 700, mb: 0.75 }}>
                Niveau de priorité
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                {Object.values(PRIORITE_PANNE).map((valeur) => (
                  <Button
                    key={valeur}
                    type="button"
                    onClick={() => setPriorite(valeur)}
                    sx={{
                      minWidth: 0,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '999px',
                      textTransform: 'none',
                      fontFamily: 'Quicksand, sans-serif',
                      fontWeight: 700,
                      bgcolor: priorite === valeur ? '#0c5d7d' : '#fff',
                      color: priorite === valeur ? '#fff' : '#0c5d7d',
                      border: '1px solid #0c5d7d',
                      '&:hover': {
                        bgcolor: priorite === valeur ? '#0a4d68' : 'rgba(12, 93, 125, 0.08)',
                      },
                    }}
                  >
                    {PRIORITE_PANNE_LABELS[valeur]}
                  </Button>
                ))}
              </Stack>

              <Button
                type="submit"
                disabled={envoi || equipements.length === 0}
                sx={{
                  width: '100%',
                  py: 1,
                  borderRadius: '999px',
                  bgcolor: '#dc5e60',
                  color: '#fff',
                  fontWeight: 700,
                  fontFamily: 'Quicksand, sans-serif',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#c95355' },
                }}
              >
                {envoi ? 'Envoi…' : 'Soumettre le signalement'}
              </Button>
            </Paper>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: '#fff',
              boxShadow: '0 4px 12px rgba(12, 93, 125, 0.12)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography sx={{ color: '#0c5d7d', fontSize: 20, fontWeight: 700 }}>
                Mes Signalements Récents
              </Typography>
              <Link
                component={RouterLink}
                to="/assistance/mes-signalements"
                underline="none"
                sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 14 }}
              >
                Voir tous mes tickets →
              </Link>
            </Stack>
            <TableContainer sx={{ border: '2px solid #146f42', borderRadius: '9px', overflowX: 'auto' }}>
              <Table
                size="small"
                aria-label="Signalements récents"
                sx={{
                  minWidth: 560,
                  '& .MuiTableCell-root': {
                    borderBottom: 'none',
                    color: '#0c5d7d',
                    fontFamily: 'Quicksand, sans-serif',
                  },
                }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: '#0c5d7d', height: 38 }}>
                    {['N° Ticket', 'Équipement', 'Date', 'Statut'].map((colonne) => (
                      <TableCell
                        key={colonne}
                        sx={{ px: 1.5, py: 0.75, color: '#fff !important', fontSize: 15, fontWeight: 700 }}
                      >
                        {colonne}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        Vous n’avez pas encore de signalement.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recents.map((panne, index) => {
                      const badge = statutTicket(panne.statut)
                      return (
                        <TableRow key={panne.idPanne} sx={{ bgcolor: index % 2 === 0 ? '#fff' : '#f3f4f6' }}>
                          <TableCell sx={{ px: 1.5, fontWeight: 700 }}>{numeroTicket(panne)}</TableCell>
                          <TableCell sx={{ px: 1.5 }}>{libelleEquipement(panne.equipement)}</TableCell>
                          <TableCell sx={{ px: 1.5 }}>{formaterDate(panne.dateSurvenance)}</TableCell>
                          <TableCell sx={{ px: 1.5 }}>
                            <Chip
                              label={badge.label}
                              size="small"
                              sx={{
                                height: 22,
                                bgcolor: badge.bgcolor,
                                color: '#fff',
                                fontWeight: 700,
                                fontFamily: 'Quicksand, sans-serif',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      )}
    </Box>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  if (user?.role === ROLES.AGENT) return <EspaceAgentContent />
  if (user?.role === ROLES.TECHNICIEN) return <EspaceTechnicienContent />

  return (
    <Box sx={{ p: 4 }}>
      <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 22 }}>Tableau de bord</Typography>
      <Typography sx={{ color: '#5C6B64', mt: 1 }}>
        Votre rôle actuel : {user?.role || 'inconnu'}.
      </Typography>
    </Box>
  )
}
