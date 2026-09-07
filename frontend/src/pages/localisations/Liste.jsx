/*

Nom du fichier   : Liste.jsx
Objectif         : Page Gestion des localisations - liste filtrable/recherchable
                    (par annexe/service), creation/edition via Form.jsx,
                    suppression avec confirmation (ConfirmDialog)
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026

*/

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'

import iconRecherche from '../../assets/icons/icon-recherche.svg'
import iconModifier from '../../assets/icons/icon-modifier.svg'
import backgroundPic from '../../assets/background/backgroundpic.png'

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Snackbar,
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

import ConfirmDialog from '../../components/common/ConfirmDialog'
import { localisationApi } from '../../api/localisationApi'

function IconImg({ src, size = 18, sx, ...props }) {
  return (
    <Box
      component="img"
      src={src}
      alt=""
      aria-hidden="true"
      sx={{ width: size, height: size, ...sx }}
      {...props}
    />
  )
}

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
  '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center' },
}

const columns = [
  { label: 'ID', width: '8%' },
  { label: 'Annexe', width: '22%' },
  { label: 'Service', width: '22%' },
  { label: 'Bureau', width: '18%' },
  { label: 'Poste', width: '18%' },
  { label: '', width: '12%' },
]

export default function Liste() {
  const navigate = useNavigate()

  const [localisations, setLocalisations] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreurChargement, setErreurChargement] = useState('')

  const [annexeFilter, setAnnexeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState('10')

  const [aSupprimer, setASupprimer] = useState(null)
  const [suppression, setSuppression] = useState(false)
  const [erreurSuppression, setErreurSuppression] = useState('')
  const [confirmationOuverte, setConfirmationOuverte] = useState(false)

  async function chargerLocalisations() {
    setLoading(true)
    setErreurChargement('')
    try {
      const response = await localisationApi.listerToutes()
      setLocalisations(response.data)
    } catch {
      setErreurChargement('Impossible de charger la liste des localisations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerLocalisations()
  }, [])

  const annexesDisponibles = useMemo(
    () => [...new Set(localisations.map((loc) => loc.annexe).filter(Boolean))].sort(),
    [localisations]
  )

  const localisationsFiltrees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return localisations.filter((loc) => {
      const matchAnnexe = !annexeFilter || loc.annexe === annexeFilter
      const matchRecherche =
        !query ||
        [loc.idLocalisation, loc.annexe, loc.service, loc.bureau, loc.poste]
          .filter(Boolean)
          .some((valeur) => String(valeur).toLowerCase().includes(query))
      return matchAnnexe && matchRecherche
    })
  }, [localisations, annexeFilter, searchQuery])

  const parPage = Number(rowsPerPage)
  const nombrePages = Math.max(1, Math.ceil(localisationsFiltrees.length / parPage))
  const pageActuelle = Math.min(page, nombrePages)
  const localisationsAffichees = localisationsFiltrees.slice(
    (pageActuelle - 1) * parPage,
    pageActuelle * parPage
  )

  function demanderSuppression(localisation) {
    setASupprimer(localisation)
    setConfirmationOuverte(true)
  }

  function annulerSuppression() {
    setConfirmationOuverte(false)
    setASupprimer(null)
  }

  async function confirmerSuppression() {
    if (!aSupprimer) return
    setSuppression(true)
    setErreurSuppression('')
    try {
      await localisationApi.supprimer(aSupprimer.idLocalisation)
      setConfirmationOuverte(false)
      setASupprimer(null)
      await chargerLocalisations()
    } catch (error) {
      setErreurSuppression(
        error.response?.data?.message ||
        "Impossible de supprimer cette localisation - elle est peut-être encore liée à un équipement."
      )
    } finally {
      setSuppression(false)
    }
  }

  return (
    <>
      <Box
        component="section"
        aria-labelledby="localisation-management-title"
        sx={{
          width: '100%',
          backgroundImage: `linear-gradient(
                      rgba(204, 204, 204, 0.6),
                      rgba(201, 201, 201, 0.8)
                  ),
                  url(${backgroundPic})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          px: { xs: 1.5, sm: 3 },
          pt: 2.5,
          pb: 3,
          fontFamily: 'Quicksand, sans-serif',
          boxSizing: 'border-box',
          flex: 1,
        }}
      >
        <Stack
          component="header"
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Typography
            id="localisation-management-title"
            component="h2"
            sx={{ color: '#0c5d7d', fontSize: '24px', lineHeight: 1.2, fontWeight: 700 }}
          >
            Liste des localisations
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: 150, ...controlSx }}>
              <Select
                aria-label="Filtrer par annexe"
                displayEmpty
                value={annexeFilter}
                onChange={(event) => {
                  setAnnexeFilter(event.target.value)
                  setPage(1)
                }}
                renderValue={(value) => value || 'Filtrer par annexe'}
              >
                <MenuItem value="">Toutes les annexes</MenuItem>
                {annexesDisponibles.map((annexe) => (
                  <MenuItem key={annexe} value={annexe}>
                    {annexe}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Autocomplete
              freeSolo
              disableClearable
              options={[]}
              inputValue={searchQuery}
              onInputChange={(_, value) => {
                setSearchQuery(value)
                setPage(1)
              }}
              sx={{ width: { xs: 160, sm: 200 }, ...controlSx }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Rechercher..."
                  inputProps={{ ...params.inputProps, 'aria-label': 'Rechercher une localisation' }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <IconImg src={iconRecherche} size={14} sx={{ mr: 0.5 }} />,
                  }}
                />
              )}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/gestion/localisations/nouveau')}
              sx={{
                bgcolor: '#146f42',
                textTransform: 'none',
                fontFamily: 'Quicksand, sans-serif',
                fontWeight: 700,
                borderRadius: '7px',
                '&:hover': { bgcolor: '#0f5a35' },
              }}
            >
              Nouvelle localisation
            </Button>
          </Stack>
        </Stack>

        {erreurChargement && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {erreurChargement}
          </Alert>
        )}

        <TableContainer sx={{ border: '2px solid #146f42', borderRadius: '9px', overflowX: 'auto', overflowY: 'hidden' }}>
          <Table
            size="small"
            aria-label="Liste des localisations"
            sx={{
              minWidth: 640,
              tableLayout: 'fixed',
              '& .MuiTableCell-root': { borderBottom: 'none', color: '#0c5d7d', fontFamily: 'Quicksand, sans-serif', whiteSpace: 'nowrap' },
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: '#0c5d7d', height: 38 }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.label || 'actions'}
                    sx={{ width: column.width, px: 1.5, py: 0.75, color: '#fff !important', fontSize: '13px', fontWeight: 700, lineHeight: 1 }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : localisationsAffichees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4, fontSize: 14 }}>
                    Aucune localisation trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                localisationsAffichees.map((localisation, index) => (
                  <TableRow
                    key={localisation.idLocalisation}
                    sx={{ height: 42, bgcolor: index % 2 === 0 ? '#fff' : '#f3f4f6' }}
                  >
                    <TableCell sx={{ px: 1.5, py: 0.75, fontSize: '14px', fontWeight: 600 }}>
                      {localisation.idLocalisation}
                    </TableCell>
                    <TableCell sx={{ px: 1.5, py: 0.75, fontSize: '14px' }}>{localisation.annexe}</TableCell>
                    <TableCell sx={{ px: 1.5, py: 0.75, fontSize: '14px' }}>{localisation.service}</TableCell>
                    <TableCell sx={{ px: 1.5, py: 0.75, fontSize: '14px' }}>{localisation.bureau || '—'}</TableCell>
                    <TableCell sx={{ px: 1.5, py: 0.75, fontSize: '14px' }}>{localisation.poste || '—'}</TableCell>
                    <TableCell align="center" sx={{ px: 0.5, py: 0.75 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Button
                          aria-label={`Modifier la localisation ${localisation.idLocalisation}`}
                          onClick={() => navigate(`/gestion/localisations/${localisation.idLocalisation}/modifier`)}
                          sx={{ minWidth: 0, p: 0.25, color: '#0c5d7d', '&:hover': { bgcolor: 'transparent' } }}
                        >
                          <IconImg src={iconModifier} size={17} />
                        </Button>
                        <Button
                          aria-label={`Supprimer la localisation ${localisation.idLocalisation}`}
                          onClick={() => demanderSuppression(localisation)}
                          sx={{
                            minWidth: 0,
                            px: 1,
                            py: 0.25,
                            color: '#dc5e60',
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'transparent' },
                          }}
                        >
                          Supprimer
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack
          component="footer"
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
                aria-label="Lignes affichées"
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
              sx={{ minWidth: 75, height: 30, px: 1, borderColor: 'rgba(13, 93, 125, 0.2)', borderRadius: '5px', color: '#0c5d7d', fontSize: '13px', fontWeight: 600, textTransform: 'none' }}
            >
              Précédent
            </Button>
            {Array.from({ length: nombrePages }, (_, i) => i + 1).map((numeroPage) => (
              <Button
                key={numeroPage}
                aria-label={`Page ${numeroPage}`}
                variant={pageActuelle === numeroPage ? 'contained' : 'outlined'}
                onClick={() => setPage(numeroPage)}
                sx={{
                  minWidth: 30,
                  width: 30,
                  height: 30,
                  p: 0,
                  borderRadius: '5px',
                  borderColor: 'rgba(13, 93, 125, 0.2)',
                  bgcolor: pageActuelle === numeroPage ? '#0c5d7d' : '#fff',
                  color: pageActuelle === numeroPage ? '#fff' : '#0c5d7d',
                  fontSize: '13px',
                  fontWeight: pageActuelle === numeroPage ? 700 : 600,
                }}
              >
                {numeroPage}
              </Button>
            ))}
            <Button
              variant="outlined"
              disabled={pageActuelle === nombrePages}
              onClick={() => setPage((current) => Math.min(nombrePages, current + 1))}
              sx={{ minWidth: 65, height: 30, px: 1, borderColor: 'rgba(13, 93, 125, 0.2)', borderRadius: '5px', color: '#0c5d7d', fontSize: '13px', fontWeight: 600, textTransform: 'none' }}
            >
              Suivant
            </Button>
          </Stack>
        </Stack>
      </Box>

      <ConfirmDialog
        open={confirmationOuverte}
        title="Supprimer cette localisation ?"
        message={
          aSupprimer
            ? `"${aSupprimer.annexe} - ${aSupprimer.service}" sera définitivement supprimée. Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        confirmColor="error"
        onConfirm={confirmerSuppression}
        onCancel={annulerSuppression}
        loading={suppression}
      />

      <Snackbar
        open={Boolean(erreurSuppression)}
        autoHideDuration={5000}
        onClose={() => setErreurSuppression('')}
        message={erreurSuppression}
      />
    </>
  )
}