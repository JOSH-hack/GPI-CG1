/*

Nom du fichier   : Liste.jsx
Objectif         : Vue Globale du Parc - liste de tous les equipements avec filtres (categorie, statut), recherche par code inventaire/nom, fidele a la maquette global-Parc
Propriétaire     : Josué BEDEL
Date de création : 04/09/2026

*/

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
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
import AddIcon from '@mui/icons-material/Add'

import { equipementApi } from '../../api/equipementApi'
import { categorieApi } from '../../api/categorieApi'
import backgroundPic from '../../assets/background/backgroundpic.png'
import StatusChip from '../../components/common/StatusChip'
import { STATUT_EQUIPEMENT, STATUT_EQUIPEMENT_LABELS } from '../../utils/constants'

const controlSx = {
  '& .MuiOutlinedInput-root': {
    height: 34,
    borderRadius: '5px',
    fontFamily: 'Quicksand, sans-serif',
    fontSize: '13px',
  },
}

function libelleLocalisation(loc) {
  if (!loc) return '—'
  return [loc.annexe, loc.service, loc.bureau].filter(Boolean).join(' - ')
}

export default function Liste() {
  const navigate = useNavigate()

  const [equipements, setEquipements] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [filtreCategorie, setFiltreCategorie] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState('10')

  async function chargerDonnees() {
    setLoading(true)
    setErreur('')
    try {
      const [resEquipements, resCategories] = await Promise.all([
        equipementApi.listerTous(),
        categorieApi.listerTous(),
      ])
      setEquipements(resEquipements.data)
      setCategories(resCategories.data)
    } catch {
      setErreur('Impossible de charger la liste des équipements.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerDonnees()
  }, [])

  const equipementsFiltres = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return equipements.filter((equipement) => {
      const matchCategorie = !filtreCategorie || equipement.categorie?.idCategorie === Number(filtreCategorie)
      const matchStatut = !filtreStatut || equipement.statut === filtreStatut
      const matchRecherche =
        !query ||
        [equipement.codeInventaire, equipement.nom]
          .filter(Boolean)
          .some((valeur) => String(valeur).toLowerCase().includes(query))
      return matchCategorie && matchStatut && matchRecherche
    })
  }, [equipements, searchQuery, filtreCategorie, filtreStatut])

  const parPage = Number(rowsPerPage)
  const nombrePages = Math.max(1, Math.ceil(equipementsFiltres.length / parPage))
  const pageActuelle = Math.min(page, nombrePages)
  const equipementsAffiches = equipementsFiltres.slice(
    (pageActuelle - 1) * parPage,
    pageActuelle * parPage
  )

  function formaterDate(dateIso) {
    if (!dateIso) return '—'
    return new Date(dateIso).toLocaleDateString('fr-FR')
  }

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        width: '100%',
        px: { xs: 1.5, sm: 3 },
        pt: 2.5,
        pb: 3,
        fontFamily: 'Quicksand, sans-serif',
        boxSizing: 'border-box',
        flex: 1,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: ` linear-gradient(rgb(211, 209, 209), rgba(219, 219, 219, 0.63)), url(${backgroundPic})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 1,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Typography sx={{ color: '#0c5d7d', fontSize: '24px', fontWeight: 700 }}>
            Vue Globale de tous les équipements du parc
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150, ...controlSx }}>
              <Select
                displayEmpty
                value={filtreCategorie}
                onChange={(event) => {
                  setFiltreCategorie(event.target.value)
                  setPage(1)
                }}
                renderValue={(value) =>
                  value ? categories.find((c) => c.idCategorie === Number(value))?.libelle : 'Catégorie'
                }
              >
                <MenuItem value="">Toutes les catégories</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.idCategorie} value={c.idCategorie}>
                    {c.libelle}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 130, ...controlSx }}>
              <Select
                displayEmpty
                value={filtreStatut}
                onChange={(event) => {
                  setFiltreStatut(event.target.value)
                  setPage(1)
                }}
                renderValue={(value) => (value ? STATUT_EQUIPEMENT_LABELS[value] : 'Statut')}
              >
                <MenuItem value="">Tous les statuts</MenuItem>
                {Object.values(STATUT_EQUIPEMENT).map((s) => (
                  <MenuItem key={s} value={s}>
                    {STATUT_EQUIPEMENT_LABELS[s]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Code inventaire, nom..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setPage(1)
              }}
              sx={{ width: 200, ...controlSx }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/parc/equipements/nouveau')}
              sx={{ bgcolor: '#1b7548', textTransform: 'none', '&:hover': { bgcolor: '#145d39' } }}
            >
              Ajouter
            </Button>
          </Stack>
        </Stack>

        {erreur && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {erreur}
          </Alert>
        )}

        <TableContainer component={Paper} sx={{ border: '2px solid #146f42', borderRadius: '9px' }}>
          <Table
            size="small"
            sx={{
              tableLayout: 'fixed',
              '& .MuiTableCell-root': { borderBottom: 'none', color: '#0c5d7d', fontFamily: 'Quicksand, sans-serif' },
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: '#0c5d7d', height: 46 }}>
                {['Code Inventaire', 'Nom', 'Catégorie', 'Localisation', 'Statut', 'Agent Affecté', "Date d'acquisition"].map(
                  (label) => (
                    <TableCell key={label} sx={{ px: 1.5, color: '#fff !important', fontSize: '15px', fontWeight: 700 }}>
                      {label}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : equipementsAffiches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, fontSize: 15 }}>
                    Aucun équipement trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                equipementsAffiches.map((equipement, index) => (
                  <TableRow
                    key={equipement.idEquipement}
                    hover
                    onClick={() => navigate(`/parc/equipements/${equipement.idEquipement}`)}
                    sx={{
                      cursor: 'pointer',
                      height: 50,
                      bgcolor: index % 2 === 0 ? '#fff' : '#f3f4f6',
                    }}
                  >
                    <TableCell sx={{ px: 1.5, fontSize: '15px', fontWeight: 600 }}>
                      {equipement.codeInventaire}
                    </TableCell>
                    <TableCell sx={{ px: 1.5, fontSize: '15px' }}>{equipement.nom}</TableCell>
                    <TableCell sx={{ px: 1.5, fontSize: '15px' }}>{equipement.categorie?.libelle || '—'}</TableCell>
                    <TableCell sx={{ px: 1.5, fontSize: '15px' }}>{libelleLocalisation(equipement.localisation)}</TableCell>
                    <TableCell sx={{ px: 1.5 }}>
                      <StatusChip type="statutEquipement" value={equipement.statut} />
                    </TableCell>
                    <TableCell sx={{ px: 1.5, fontSize: '15px' }}>
                      {equipement.agent ? `${equipement.agent.nom} ${equipement.agent.prenom}` : 'Non affecté'}
                    </TableCell>
                    <TableCell sx={{ px: 1.5, fontSize: '15px' }}>{formaterDate(equipement.dateAcquisition)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mt: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography sx={{ color: '#0c5d7d', fontSize: '14px' }}>Lignes affichées</Typography>
            <FormControl size="small" sx={{ minWidth: 60, ...controlSx }}>
              <Select
                value={rowsPerPage}
                onChange={(event) => {
                  setRowsPerPage(event.target.value)
                  setPage(1)
                }}
              >
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
              sx={{ fontSize: '12px', textTransform: 'none' }}
            >
              Précédent
            </Button>
            {Array.from({ length: nombrePages }, (_, i) => i + 1).map((numeroPage) => (
              <Button
                key={numeroPage}
                variant={pageActuelle === numeroPage ? 'contained' : 'outlined'}
                onClick={() => setPage(numeroPage)}
                sx={{
                  minWidth: 32,
                  bgcolor: pageActuelle === numeroPage ? '#0c5d7d' : '#fff',
                  color: pageActuelle === numeroPage ? '#fff' : '#0c5d7d',
                  fontSize: '12px',
                }}
              >
                {numeroPage}
              </Button>
            ))}
            <Button
              variant="outlined"
              disabled={pageActuelle === nombrePages}
              onClick={() => setPage((current) => Math.min(nombrePages, current + 1))}
              sx={{ fontSize: '12px', textTransform: 'none' }}
            >
              Suivant
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}