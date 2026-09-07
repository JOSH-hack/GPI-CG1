/*

Nom du fichier   : EnAttenteDsi.jsx
Objectif         : Interventions dont le rapport est redige et en attente de
                    validation DSI - reservee au DSI/admins, clic renvoie vers
                    le ticket pour valider (SurTicket)
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import { interventionApi } from '../../api/interventionApi'
import backgroundPic from '../../assets/background/backgroundpic.png'
import { TYPE_INTERVENTION_LABELS } from '../../utils/constants'

function numeroTicket(panne) {
  if (!panne) return '—'
  const annee = panne.dateSurvenance ? new Date(panne.dateSurvenance).getFullYear() : new Date().getFullYear()
  return `TK-${annee}-${String(panne.idPanne).padStart(4, '0')}`
}

function formaterDateHeure(valeur) {
  if (!valeur) return '—'
  return new Date(valeur).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function EnAttenteDsi() {
  const navigate = useNavigate()
  const [interventions, setInterventions] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    interventionApi
      .listerEnAttenteDsi()
      .then((res) => setInterventions(res.data))
      .catch(() => setErreur('Impossible de charger les interventions en attente.'))
      .finally(() => setChargement(false))
  }, [])

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
        <Typography sx={{ color: '#0c5d7d', fontSize: 24, fontWeight: 700, mb: 2 }}>
          Interventions en attente de validation DSI
        </Typography>

        {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}

        <TableContainer sx={{ border: '2px solid #146f42', borderRadius: '9px', overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#0c5d7d' }}>
                {['N° Ticket', 'Équipement', 'Technicien', 'Type', 'Rapport soumis le', ''].map((label) => (
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
              ) : interventions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    Aucune intervention en attente de validation.
                  </TableCell>
                </TableRow>
              ) : (
                interventions.map((intervention, index) => (
                  <TableRow key={intervention.idIntervention} sx={{ bgcolor: index % 2 === 0 ? '#fff' : '#f3f4f6' }}>
                    <TableCell sx={{ color: '#0c5d7d', fontWeight: 600 }}>{numeroTicket(intervention.panne)}</TableCell>
                    <TableCell sx={{ color: '#0c5d7d' }}>{intervention.panne?.equipement?.codeInventaire}</TableCell>
                    <TableCell sx={{ color: '#0c5d7d' }}>
                      {intervention.technicien?.nom} {intervention.technicien?.prenom}
                    </TableCell>
                    <TableCell sx={{ color: '#0c5d7d' }}>{TYPE_INTERVENTION_LABELS[intervention.typeIntervention]}</TableCell>
                    <TableCell sx={{ color: '#0c5d7d' }}>{formaterDateHeure(intervention.dateRapport)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/assistance/interventions/ticket/${intervention.panne?.idPanne}`)}
                        sx={{ bgcolor: '#146f42', textTransform: 'none', '&:hover': { bgcolor: '#0f5a35' } }}
                      >
                        Examiner
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}