/*

Nom du fichier   : MesSignalements.jsx
Objectif         : Page dediee "Mes signalements" pour l'agent - liste complete
                    de ses pannes signalees, avec filtre par statut (le
                    Dashboard n'en montre qu'un apercu de 3)
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import { useEffect, useMemo, useState } from 'react'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import { panneApi } from '../../api/panneApi'
import backgroundPic from '../../assets/background/backgroundpic.png'
import { STATUT_PANNE, PRIORITE_PANNE_LABELS } from '../../utils/constants'

function numeroTicket(panne) {
  const annee = panne.dateSurvenance ? new Date(panne.dateSurvenance).getFullYear() : new Date().getFullYear()
  return `TK-${annee}-${String(panne.idPanne).padStart(4, '0')}`
}

function formaterDate(valeur) {
  if (!valeur) return '—'
  return new Date(valeur).toLocaleDateString('fr-FR')
}

function libelleEquipement(equipement) {
  if (!equipement) return '—'
  const marqueModele = [equipement.marque, equipement.modele].filter(Boolean).join(' ')
  return marqueModele || equipement.nom || 'Équipement'
}

function statutTicket(statut) {
  if (statut === STATUT_PANNE.SIGNALEE) return { label: 'En attente', bgcolor: '#dc5e60' }
  if (statut === STATUT_PANNE.EN_COURS_TRAITEMENT) return { label: 'En cours', bgcolor: '#e6a817' }
  if (statut === STATUT_PANNE.REPAREE) return { label: 'Résolu', bgcolor: '#1b7548' }
  return { label: 'Réformé', bgcolor: '#9CA3AF' }
}

const controlSx = {
  '& .MuiOutlinedInput-root': { height: 36, borderRadius: '6px', fontFamily: 'Quicksand, sans-serif' },
}

function NoteSatisfaction({ panne, onNote }) {
  const [envoi, setEnvoi] = useState(false)
  const [survol, setSurvol] = useState(0)

  if (panne.statut !== STATUT_PANNE.REPAREE) return <>—</>

  async function handleClick(valeur) {
    setEnvoi(true)
    try {
      await panneApi.noter(panne.idPanne, valeur)
      onNote()
    } finally {
      setEnvoi(false)
    }
  }

  const valeurAffichee = survol || panne.noteSatisfaction || 0

  return (
    <Stack direction="row" spacing={0.15} onMouseLeave={() => setSurvol(0)}>
      {Array.from({ length: 5 }).map((_, index) => {
        const valeur = index + 1
        const rempli = valeur <= valeurAffichee
        const dejaNote = Boolean(panne.noteSatisfaction)
        const Icone = rempli ? StarIcon : StarBorderIcon
        return (
          <Icone
            key={index}
            onClick={() => !envoi && !dejaNote && handleClick(valeur)}
            onMouseEnter={() => !dejaNote && setSurvol(valeur)}
            sx={{
              fontSize: 20,
              color: rempli ? '#e6a817' : '#c4c4c4',
              cursor: dejaNote ? 'default' : 'pointer',
            }}
          />
        )
      })}
    </Stack>
  )
}

export default function MesSignalements() {
  const navigate = useNavigate()
  const [signalements, setSignalements] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('TOUS')

  useEffect(() => {
    panneApi
      .mesSignalements()
      .then((res) => setSignalements(res.data))
      .catch(() => setErreur('Impossible de charger vos signalements.'))
      .finally(() => setChargement(false))
  }, [])

  const signalementsFiltres = useMemo(() => {
    const liste =
      filtreStatut === 'TOUS' ? signalements : signalements.filter((p) => p.statut === filtreStatut)
    return [...liste].sort((a, b) => new Date(b.dateSurvenance || 0) - new Date(a.dateSurvenance || 0))
  }, [signalements, filtreStatut])

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        p: { xs: 1.5, sm: 3 },
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'Quicksand, sans-serif',
        flex: 1,
        minHeight: '100%',
      }}
    >      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `linear-gradient(rgba(204, 204, 204, 0.6), rgba(201, 201, 201, 0.8)), url(${backgroundPic})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 1.15,
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Typography sx={{ color: '#0c5d7d', fontSize: 24, fontWeight: 700 }}>Mes signalements</Typography>

          <FormControl size="small" sx={{ minWidth: 170, ...controlSx }}>
            <Select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
              <MenuItem value="TOUS">Tous les statuts</MenuItem>
              {Object.values(STATUT_PANNE).map((s) => (
                <MenuItem key={s} value={s}>{statutTicket(s).label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}

        <TableContainer sx={{ border: '2px solid #146f42', borderRadius: '9px', overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#0c5d7d' }}>
                {['N° Ticket', 'Équipement', 'Description', 'Priorité', 'Date', 'Statut', 'Satisfaction'].map((label) => (                  <TableCell key={label} sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                    {label}
                  </TableCell>
                ))}
          
              </TableRow>
            </TableHead>
            <TableBody>
              {chargement ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                  
                </TableRow>
              ) : signalementsFiltres.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    Aucun signalement.
                  </TableCell>
                </TableRow>
              ) : (
                signalementsFiltres.map((panne, index) => {
                  const badge = statutTicket(panne.statut)
                  return (
                    <TableRow
                      key={panne.idPanne}
                      hover
                      onClick={() => navigate(`/assistance/interventions/ticket/${panne.idPanne}`)}
                      sx={{ cursor: 'pointer', bgcolor: index % 2 === 0 ? '#fff' : '#f3f4f6' }}
                    >
                      <TableCell sx={{ color: '#0c5d7d', fontWeight: 600 }}>{numeroTicket(panne)}</TableCell>
                      <TableCell sx={{ color: '#0c5d7d' }}>{libelleEquipement(panne.equipement)}</TableCell>
                      <TableCell sx={{ color: '#0c5d7d' }}>{panne.description}</TableCell>
                      <TableCell sx={{ color: '#0c5d7d' }}>{PRIORITE_PANNE_LABELS[panne.priorite]}</TableCell>
                      <TableCell sx={{ color: '#0c5d7d' }}>{formaterDate(panne.dateSurvenance)}</TableCell>
                      <TableCell>
                        <Chip label={badge.label} size="small" sx={{ bgcolor: badge.bgcolor, color: '#fff', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={badge.label} size="small" sx={{ bgcolor: badge.bgcolor, color: '#fff', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <NoteSatisfaction panne={panne} onNote={() => panneApi.mesSignalements().then((res) => setSignalements(res.data))} />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}