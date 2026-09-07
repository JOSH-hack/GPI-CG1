/*

Nom du fichier   : Liste.jsx
Objectif         : Vue globale de toutes les interventions (tous techniciens,
                    tous statuts) - filtres par statut derive et type, clic
                    sur une ligne renvoie vers le ticket (SurTicket)
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import { useEffect, useMemo, useState } from 'react'
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
  TextField,
  Typography,
} from '@mui/material'

import { interventionApi } from '../../api/interventionApi'
import backgroundPic from '../../assets/background/backgroundpic.png'
import { TYPE_INTERVENTION, TYPE_INTERVENTION_LABELS } from '../../utils/constants'

const STATUT_DERIVE = {
  EN_COURS: 'EN_COURS',
  RESULTAT_EN_ATTENTE: 'RESULTAT_EN_ATTENTE',
  EN_ATTENTE_VALIDATION: 'EN_ATTENTE_VALIDATION',
  TERMINEE: 'TERMINEE',
}

const STATUT_DERIVE_LABELS = {
  [STATUT_DERIVE.EN_COURS]: 'En cours',
  [STATUT_DERIVE.RESULTAT_EN_ATTENTE]: 'Résultat en attente',
  [STATUT_DERIVE.EN_ATTENTE_VALIDATION]: 'En attente de validation',
  [STATUT_DERIVE.TERMINEE]: 'Terminée',
}

const STATUT_DERIVE_COLORS = {
  [STATUT_DERIVE.EN_COURS]: '#e6a817',
  [STATUT_DERIVE.RESULTAT_EN_ATTENTE]: '#f97316',
  [STATUT_DERIVE.EN_ATTENTE_VALIDATION]: '#0c5d7d',
  [STATUT_DERIVE.TERMINEE]: '#1b7548',
}

function statutDerive(intervention) {
  if (intervention.dateValidationDsi) return STATUT_DERIVE.TERMINEE
  if (intervention.rapport) return STATUT_DERIVE.EN_ATTENTE_VALIDATION
  if (intervention.dateResolution) return STATUT_DERIVE.RESULTAT_EN_ATTENTE
  return STATUT_DERIVE.EN_COURS
}

function numeroTicket(panne) {
  if (!panne) return '—'
  const annee = panne.dateSurvenance ? new Date(panne.dateSurvenance).getFullYear() : new Date().getFullYear()
  return `TK-${annee}-${String(panne.idPanne).padStart(4, '0')}`
}

function formaterDateHeure(valeur) {
  if (!valeur) return '—'
  return new Date(valeur).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

const controlSx = {
  '& .MuiOutlinedInput-root': { height: 36, borderRadius: '6px', fontFamily: 'Quicksand, sans-serif' },
}

export default function InterventionsListe() {
  const navigate = useNavigate()
  const [interventions, setInterventions] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [filtreType, setFiltreType] = useState('TOUS')
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    interventionApi
      .listerToutes()
      .then((res) => setInterventions(res.data))
      .catch(() => setErreur('Impossible de charger les interventions.'))
      .finally(() => setChargement(false))
  }, [])

  const interventionsFiltrees = useMemo(() => {
    const query = recherche.trim().toLowerCase()
    return interventions.filter((i) => {
      const matchStatut = filtreStatut === 'TOUS' || statutDerive(i) === filtreStatut
      const matchType = filtreType === 'TOUS' || i.typeIntervention === filtreType
      const matchRecherche =
        !query ||
        [i.panne?.equipement?.codeInventaire, i.technicien?.nom, i.technicien?.prenom]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(query))
      return matchStatut && matchType && matchRecherche
    })
  }, [interventions, filtreStatut, filtreType, recherche])

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
          <Typography sx={{ color: '#0c5d7d', fontSize: 24, fontWeight: 700 }}>Interventions</Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <FormControl size="small" sx={{ minWidth: 180, ...controlSx }}>
              <Select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
                <MenuItem value="TOUS">Tous les statuts</MenuItem>
                {Object.values(STATUT_DERIVE).map((s) => (
                  <MenuItem key={s} value={s}>{STATUT_DERIVE_LABELS[s]}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150, ...controlSx }}>
              <Select value={filtreType} onChange={(e) => setFiltreType(e.target.value)}>
                <MenuItem value="TOUS">Tous les types</MenuItem>
                {Object.values(TYPE_INTERVENTION).map((t) => (
                  <MenuItem key={t} value={t}>{TYPE_INTERVENTION_LABELS[t]}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Équipement, technicien..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              sx={{ width: 220, ...controlSx }}
            />
          </Stack>
        </Stack>

        {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}

        <TableContainer sx={{ border: '2px solid #146f42', borderRadius: '9px', overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#0c5d7d' }}>
                {['N° Ticket', 'Équipement', 'Technicien', 'Type', 'Statut', 'Date intervention'].map((label) => (
                  <TableCell key={label} sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {chargement ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : interventionsFiltrees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    Aucune intervention trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                interventionsFiltrees.map((intervention, index) => {
                  const statut = statutDerive(intervention)
                  return (
                    <TableRow
                      key={intervention.idIntervention}
                      hover
                      onClick={() => navigate(`/assistance/interventions/ticket/${intervention.panne?.idPanne}`)}
                      sx={{ cursor: 'pointer', bgcolor: index % 2 === 0 ? '#fff' : '#f3f4f6' }}
                    >
                      <TableCell sx={{ color: '#0c5d7d', fontWeight: 600 }}>{numeroTicket(intervention.panne)}</TableCell>
                      <TableCell sx={{ color: '#0c5d7d' }}>{intervention.panne?.equipement?.codeInventaire}</TableCell>
                      <TableCell sx={{ color: '#0c5d7d' }}>
                        {intervention.technicien?.nom} {intervention.technicien?.prenom}
                      </TableCell>
                      <TableCell sx={{ color: '#0c5d7d' }}>{TYPE_INTERVENTION_LABELS[intervention.typeIntervention]}</TableCell>
                      <TableCell>
                        <Chip
                          label={STATUT_DERIVE_LABELS[statut]}
                          size="small"
                          sx={{ bgcolor: STATUT_DERIVE_COLORS[statut], color: '#fff', fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#0c5d7d' }}>{formaterDateHeure(intervention.dateIntervention)}</TableCell>
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