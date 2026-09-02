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
import { panneApi } from '../../api/panneApi'
import {
  ROLES,
  STATUT_EQUIPEMENT,
  STATUT_PANNE,
  PRIORITE_PANNE,
  PRIORITE_PANNE_LABELS,
  TYPE_CATEGORIE_LABELS,
} from '../../utils/constants'

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

  return user?.role === ROLES.AGENT ? (
    <EspaceAgentContent />
  ) : (
    <Box sx={{ p: 4 }}>
      <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 22 }}>
        Tableau de bord
      </Typography>
      <Typography sx={{ color: '#5C6B64', mt: 1 }}>
        L’espace Agent s’affiche après une connexion avec le rôle Agent. Votre rôle actuel :{' '}
        {user?.role || 'inconnu'}.
      </Typography>
    </Box>
  )
}