/*

Nom du fichier   : Liste.jsx
Objectif         : "Tickets - Assistance" - fidele a la maquette Anima. KPIs,
                    filtres statut/priorite, recherche, colonnes configurables,
                    export statistiques, technicien assigne (croise avec
                    interventionApi puisque absent de PanneResponse)
Propriétaire     : Josué BEDEL
Date de création : 03/09/2026

*/

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import DownloadIcon from '@mui/icons-material/Download'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArchiveIcon from '@mui/icons-material/Archive'

import backgroundPic from '../../assets/background/backgroundpic.png'
import { panneApi } from '../../api/panneApi'
import { interventionApi } from '../../api/interventionApi'
import { exportApi } from '../../api/exportApi'
import {
  STATUT_PANNE,
  STATUT_PANNE_LABELS,
  PRIORITE_PANNE,
  PRIORITE_PANNE_LABELS,
} from '../../utils/constants'

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  Menu,
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
  Tooltip,
  Typography,
} from '@mui/material'

const COULEURS_STATUT = {
  [STATUT_PANNE.SIGNALEE]: '#dc5e60',
  [STATUT_PANNE.EN_COURS_TRAITEMENT]: '#e6a817',
  [STATUT_PANNE.REPAREE]: '#1b7548',
  [STATUT_PANNE.REFORMEE]: '#9CA3AF',
}

const COULEURS_PRIORITE = {
  [PRIORITE_PANNE.FAIBLE]: '#9CA3AF',
  [PRIORITE_PANNE.MOYENNE]: '#e6a817',
  [PRIORITE_PANNE.ELEVEE]: '#dc5e60',
  [PRIORITE_PANNE.CRITIQUE]: '#c0392b',
}

const TOUTES_COLONNES = [
  { id: 'description', label: 'Description' },
  { id: 'statut', label: 'Statut' },
  { id: 'priorite', label: 'Priorité' },
  { id: 'date', label: 'Date de survenance' },
  { id: 'equipement', label: 'Équipement concerné' },
  { id: 'agent', label: 'Agent signaleur' },
  { id: 'technicien', label: 'Technicien assigné' },
]

const controlSx = {
  '& .MuiOutlinedInput-root': {
    height: 34,
    borderRadius: '5px',
    color: '#0c5d7d',
    fontSize: '13px',
    fontWeight: 500,
    fontFamily: 'Quicksand, sans-serif',
  },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(13, 93, 125, 0.2)' },
}

function formaterDate(valeur) {
  if (!valeur) return '—'
  return new Date(valeur).toLocaleDateString('fr-FR')
}

function KpiCard({ icon, valeur, label, color }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        flex: 1,
        minWidth: 130,
        px: 1.75,
        py: 1.25,
        borderRadius: '10px',
        border: '1px solid rgba(13, 93, 125, 0.15)',
        bgcolor: '#fff',
      }}
    >
      <Box sx={{ color, display: 'grid', placeItems: 'center' }}>{icon}</Box>
      <Box>
        <Typography sx={{ color: '#0c5d7d', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{valeur}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 600, mt: 0.25 }}>{label}</Typography>
      </Box>
    </Stack>
  )
}

export default function Liste() {
  const navigate = useNavigate()

  const [pannes, setPannes] = useState([])
  const [techniciensParPanne, setTechniciensParPanne] = useState({})
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')

  const [statutFilter, setStatutFilter] = useState('')
  const [prioriteFilter, setPrioriteFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState('20')

  const [colonnesVisibles, setColonnesVisibles] = useState(TOUTES_COLONNES.map((c) => c.id))
  const [menuColonnesAncre, setMenuColonnesAncre] = useState(null)
  const [menuExportAncre, setMenuExportAncre] = useState(null)
  const [exportEnCours, setExportEnCours] = useState(false)

  async function chargerDonnees() {
    setLoading(true)
    setErreur('')
    try {
      const statuts = Object.values(STATUT_PANNE)
      const [reponsesParStatut, reponseInterventions] = await Promise.all([
        Promise.all(statuts.map((statut) => panneApi.listerParStatut(statut))),
        interventionApi.listerToutes(),
      ])

      const toutesPannes = reponsesParStatut.flatMap((reponse) => reponse.data)
      setPannes(toutesPannes)

      const map = {}
      reponseInterventions.data.forEach((intervention) => {
        if (intervention.panne?.idPanne) {
          map[intervention.panne.idPanne] = intervention.technicien
        }
      })
      setTechniciensParPanne(map)
    } catch {
      setErreur('Impossible de charger les tickets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerDonnees()
  }, [])

  const kpis = useMemo(() => {
    const maintenant = new Date()
    return {
      total: pannes.length,
      critiques: pannes.filter(
        (p) => p.priorite === PRIORITE_PANNE.CRITIQUE && p.statut !== STATUT_PANNE.REPAREE && p.statut !== STATUT_PANNE.REFORMEE
      ).length,
      enCours: pannes.filter((p) => p.statut === STATUT_PANNE.EN_COURS_TRAITEMENT).length,
      reparees: pannes.filter((p) => {
        if (p.statut !== STATUT_PANNE.REPAREE || !p.dateSurvenance) return false
        const date = new Date(p.dateSurvenance)
        return date.getMonth() === maintenant.getMonth() && date.getFullYear() === maintenant.getFullYear()
      }).length,
      reformees: pannes.filter((p) => p.statut === STATUT_PANNE.REFORMEE).length,
    }
  }, [pannes])

  const pannesFiltrees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return pannes.filter((panne) => {
      const matchStatut = !statutFilter || panne.statut === statutFilter
      const matchPriorite = !prioriteFilter || panne.priorite === prioriteFilter
      const matchRecherche =
        !query ||
        [
          panne.idPanne,
          panne.description,
          panne.equipement?.codeInventaire,
          panne.utilisateurSignaleur?.nom,
          panne.utilisateurSignaleur?.prenom,
        ]
          .filter(Boolean)
          .some((valeur) => String(valeur).toLowerCase().includes(query))
      return matchStatut && matchPriorite && matchRecherche
    })
  }, [pannes, statutFilter, prioriteFilter, searchQuery])

  const parPage = Number(rowsPerPage)
  const nombrePages = Math.max(1, Math.ceil(pannesFiltrees.length / parPage))
  const pageActuelle = Math.min(page, nombrePages)
  const pannesAffichees = pannesFiltrees.slice((pageActuelle - 1) * parPage, pageActuelle * parPage)

  function toggleColonne(id) {
    setColonnesVisibles((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    )
  }

  async function handleExport(format) {
    setMenuExportAncre(null)
    setExportEnCours(true)
    try {
      const response = format === 'excel' ? await exportApi.exporterExcel() : await exportApi.exporterPdf()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const lien = document.createElement('a')
      lien.href = url
      lien.download = `statistiques.${format === 'excel' ? 'xlsx' : 'pdf'}`
      lien.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setErreur("Impossible de générer l'export.")
    } finally {
      setExportEnCours(false)
    }
  }

  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        backgroundImage: `linear-gradient(rgba(204, 204, 204, 0.6), rgba(201, 201, 201, 0.8)), url(${backgroundPic})`,
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
      <Typography sx={{ color: '#0c5d7d', fontSize: 22, fontWeight: 700, mb: 2, borderBottom: '3px solid #146f42', display: 'inline-block', pb: 0.5 }}>
        Tickets - Assistance
      </Typography>

      {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}

      {/* KPIs */}
      <Stack
        direction="row"
        spacing={1.5}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 2.5, p: 1.5, border: '1px dashed rgba(13, 93, 125, 0.3)', borderRadius: '10px' }}
      >
        <KpiCard icon={<WarningAmberIcon />} valeur={kpis.total} label="Pannes signalées" color="#0c5d7d" />
        <KpiCard icon={<ReportProblemIcon />} valeur={kpis.critiques} label="Pannes critiques" color="#dc5e60" />
        <KpiCard icon={<PendingActionsIcon />} valeur={kpis.enCours} label="En cours d'intervention" color="#e6a817" />
        <KpiCard icon={<CheckCircleIcon />} valeur={kpis.reparees} label="Réparées ce mois" color="#1b7548" />
        <KpiCard icon={<ArchiveIcon />} valeur={kpis.reformees} label="Réformées" color="#9CA3AF" />
      </Stack>

      {/* Filtres */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/assistance/pannes/signaler')}
          sx={{ bgcolor: '#146f42', textTransform: 'none', fontWeight: 700, borderRadius: '7px', alignSelf: 'flex-start', '&:hover': { bgcolor: '#0f5a35' } }}
        >
          Nouveau signalement
        </Button>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <FormControl size="small" sx={{ minWidth: 130, ...controlSx }}>
            <Select
              displayEmpty
              value={statutFilter}
              onChange={(event) => { setStatutFilter(event.target.value); setPage(1) }}
              renderValue={(value) => (value ? STATUT_PANNE_LABELS[value] : 'Statut')}
            >
              <MenuItem value="">Tous les statuts</MenuItem>
              {Object.values(STATUT_PANNE).map((statut) => (
                <MenuItem key={statut} value={statut}>{STATUT_PANNE_LABELS[statut]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130, ...controlSx }}>
            <Select
              displayEmpty
              value={prioriteFilter}
              onChange={(event) => { setPrioriteFilter(event.target.value); setPage(1) }}
              renderValue={(value) => (value ? PRIORITE_PANNE_LABELS[value] : 'Priorité')}
            >
              <MenuItem value="">Toutes priorités</MenuItem>
              {Object.values(PRIORITE_PANNE).map((priorite) => (
                <MenuItem key={priorite} value={priorite}>{PRIORITE_PANNE_LABELS[priorite]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(event) => { setSearchQuery(event.target.value); setPage(1) }}
            InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 16, color: '#0c5d7d', mr: 0.5 }} /> }}
            sx={{ width: 180, ...controlSx }}
          />

          <Tooltip title="Configurer l'affichage">
            <IconButton size="small" onClick={(event) => setMenuColonnesAncre(event.currentTarget)} sx={{ color: '#0c5d7d' }}>
              <TuneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={menuColonnesAncre} open={Boolean(menuColonnesAncre)} onClose={() => setMenuColonnesAncre(null)}>
            {TOUTES_COLONNES.map((colonne) => (
              <MenuItem key={colonne.id} onClick={() => toggleColonne(colonne.id)} dense>
                <FormControlLabel
                  control={<Checkbox size="small" checked={colonnesVisibles.includes(colonne.id)} />}
                  label={colonne.label}
                  sx={{ m: 0 }}
                />
              </MenuItem>
            ))}
          </Menu>

          <Tooltip title="Exporter les statistiques">
            <IconButton size="small" onClick={(event) => setMenuExportAncre(event.currentTarget)} sx={{ color: '#0c5d7d' }} disabled={exportEnCours}>
              {exportEnCours ? <CircularProgress size={18} /> : <DownloadIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Menu anchorEl={menuExportAncre} open={Boolean(menuExportAncre)} onClose={() => setMenuExportAncre(null)}>
            <MenuItem onClick={() => handleExport('excel')}>Excel (.xlsx)</MenuItem>
            <MenuItem onClick={() => handleExport('pdf')}>PDF</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      {/* Tableau */}
      <TableContainer sx={{ border: '2px solid #146f42', borderRadius: '9px', overflowX: 'auto' }}>
        <Table
          size="small"
          sx={{
            minWidth: 900,
            '& .MuiTableCell-root': { borderBottom: 'none', color: '#0c5d7d', fontFamily: 'Quicksand, sans-serif' },
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: '#0c5d7d', height: 38 }}>
              <TableCell sx={{ color: '#fff !important', width: 40 }} />
              <TableCell sx={{ color: '#fff !important', fontSize: 13, fontWeight: 700 }}>ID</TableCell>
              {TOUTES_COLONNES.filter((c) => colonnesVisibles.includes(c.id)).map((colonne) => (
                <TableCell key={colonne.id} sx={{ color: '#fff !important', fontSize: 13, fontWeight: 700 }}>
                  {colonne.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : pannesAffichees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  Aucun ticket trouvé.
                </TableCell>
              </TableRow>
            ) : (
              pannesAffichees.map((panne, index) => {
                const technicien = techniciensParPanne[panne.idPanne]
                return (
                  <TableRow
                    key={panne.idPanne}
                    hover
                    onClick={() => navigate(`/assistance/interventions/ticket/${panne.idPanne}`)}
                    sx={{ cursor: 'pointer', height: 42, bgcolor: index % 2 === 0 ? '#fff' : '#f3f4f6' }}
                  >
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <Checkbox size="small" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>TK-{String(panne.idPanne).padStart(3, '0')}</TableCell>

                    {colonnesVisibles.includes('description') && (
                      <TableCell sx={{ fontSize: 13, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {panne.description}
                      </TableCell>
                    )}
                    {colonnesVisibles.includes('statut') && (
                      <TableCell>
                        <Chip label={STATUT_PANNE_LABELS[panne.statut]} size="small" sx={{ bgcolor: COULEURS_STATUT[panne.statut], color: '#fff', fontWeight: 700, fontFamily: 'Quicksand, sans-serif' }} />
                      </TableCell>
                    )}
                    {colonnesVisibles.includes('priorite') && (
                      <TableCell>
                        <Chip label={PRIORITE_PANNE_LABELS[panne.priorite]} size="small" sx={{ bgcolor: COULEURS_PRIORITE[panne.priorite], color: '#fff', fontWeight: 700, fontFamily: 'Quicksand, sans-serif' }} />
                      </TableCell>
                    )}
                    {colonnesVisibles.includes('date') && (
                      <TableCell sx={{ fontSize: 13 }}>{formaterDate(panne.dateSurvenance)}</TableCell>
                    )}
                    {colonnesVisibles.includes('equipement') && (
                      <TableCell sx={{ fontSize: 13 }}>{panne.equipement?.codeInventaire || '—'}</TableCell>
                    )}
                    {colonnesVisibles.includes('agent') && (
                      <TableCell sx={{ fontSize: 13 }}>
                        {panne.utilisateurSignaleur ? `${panne.utilisateurSignaleur.nom} ${panne.utilisateurSignaleur.prenom?.charAt(0) || ''}.` : '—'}
                      </TableCell>
                    )}
                    {colonnesVisibles.includes('technicien') && (
                      <TableCell sx={{ fontSize: 13 }}>
                        {technicien ? `${technicien.nom} ${technicien.prenom?.charAt(0) || ''}.` : '—'}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1} sx={{ mt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography sx={{ color: '#0c5d7d', fontSize: 13 }}>Lignes par page</Typography>
          <FormControl size="small" sx={{ minWidth: 60, ...controlSx }}>
            <Select value={rowsPerPage} onChange={(event) => { setRowsPerPage(event.target.value); setPage(1) }}>
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="20">20</MenuItem>
              <MenuItem value="50">50</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Button
            variant="outlined"
            disabled={pageActuelle === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            sx={{ height: 30, px: 1.5, borderColor: 'rgba(13, 93, 125, 0.2)', borderRadius: '5px', color: '#0c5d7d', fontSize: 13, fontWeight: 600, textTransform: 'none' }}
          >
            Précédent
          </Button>
          {Array.from({ length: nombrePages }, (_, i) => i + 1).map((numeroPage) => (
            <Button
              key={numeroPage}
              variant={pageActuelle === numeroPage ? 'contained' : 'outlined'}
              onClick={() => setPage(numeroPage)}
              sx={{
                minWidth: 30, width: 30, height: 30, p: 0, borderRadius: '5px',
                borderColor: 'rgba(13, 93, 125, 0.2)',
                bgcolor: pageActuelle === numeroPage ? '#0c5d7d' : '#fff',
                color: pageActuelle === numeroPage ? '#fff' : '#0c5d7d',
                fontSize: 13, fontWeight: pageActuelle === numeroPage ? 700 : 600,
              }}
            >
              {numeroPage}
            </Button>
          ))}
          <Button
            variant="outlined"
            disabled={pageActuelle === nombrePages}
            onClick={() => setPage((current) => Math.min(nombrePages, current + 1))}
            sx={{ height: 30, px: 1.5, borderColor: 'rgba(13, 93, 125, 0.2)', borderRadius: '5px', color: '#0c5d7d', fontSize: 13, fontWeight: 600, textTransform: 'none' }}
          >
            Suivant
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}