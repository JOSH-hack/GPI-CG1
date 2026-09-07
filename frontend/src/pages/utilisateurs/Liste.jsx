/*

Nom du fichier   : Liste.jsx
Objectif         : Page Gestion des utilisateurs - fidele a la maquette Figma (via Anima, nettoye
                    et branche sur l'API reelle). Sidebar + Navbar desormais fournis par
                    DashboardLayout (voir components/layout/). Liste filtrable/recherchable +
                    modal de modification (role, statut actif/inactif, fonction si role = Agent).
Propriétaire     : Josué BEDEL
Date de création : 01/09/2026
Date de mise à jour : 02/09/2026
Objet de mise à jour : Retrait du sidebar/header duplique (deplace vers DashboardLayout / Sidebar.jsx / Navbar.jsx)

*/

import { useEffect, useMemo, useState } from 'react'

import iconRecherche from '../../assets/icons/icon-recherche.svg'
import iconModifier from '../../assets/icons/icon-modifier.svg'
import CheckIcon from '@mui/icons-material/Check'
import backgroundPic from '../../assets/background/backgroundpic.png'

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
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

import { utilisateurApi } from '../../api/utilisateurApi'
import { agentApi } from '../../api/agentApi'
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../../utils/constants'

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
    height: 28,
    borderRadius: '5px',
    color: '#0c5d7d',
    fontSize: '10px',
    fontWeight: 500,
    fontFamily: 'Quicksand, sans-serif',
  },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(13, 93, 125, 0.2)' },
  '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center' },
}

const columns = [
  { label: 'ID', width: '8%' },
  { label: 'Nom', width: '15%' },
  { label: 'Prénom', width: '15%' },
  { label: 'Email', width: '21%' },
  { label: 'Rôle', width: '14%' },
  { label: 'Actif', width: '10%' },
  { label: 'Date de création', width: '13%' },
  { label: '', width: '4%' },
]

function formaterDate(dateIso) {
  if (!dateIso) return '—'
  const date = new Date(dateIso)
  return date.toLocaleDateString('fr-FR')
}

const ROLES_ASSIGNABLES = [ROLES.AGENT, ROLES.TECHNICIEN, ROLES.ADMIN_INFO, ROLES.RESPONSABLE_DSI, ROLES.ADMIN_SYSTEME]

//  Modal de modification (role, statut, fonction) 
function ModifierUtilisateurModal({ utilisateur, open, onClose, onSaved }) {
  const [role, setRole] = useState(utilisateur?.role)
  const [actif, setActif] = useState(utilisateur?.actif)
  const [fonction, setFonction] = useState('')
  const [agentExistant, setAgentExistant] = useState(null)
  const [chargementAgent, setChargementAgent] = useState(false)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    if (!utilisateur) return
    setRole(utilisateur.role)
    setActif(utilisateur.actif)
    setFonction('')
    setAgentExistant(null)
    setErreur('')

    if (utilisateur.role === ROLES.AGENT) {
      chargerFicheAgent(utilisateur.idUtilisateur)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilisateur])

  async function chargerFicheAgent(idUtilisateur) {
    setChargementAgent(true)
    try {
      const response = await agentApi.getParUtilisateur(idUtilisateur)
      setAgentExistant(response.data)
      setFonction(response.data.fonction || '')
    } catch {
      setAgentExistant(null)
      setFonction('')
    } finally {
      setChargementAgent(false)
    }
  }

  function handleRoleClick(nouveauRole) {
    setRole(nouveauRole)
    if (nouveauRole === ROLES.AGENT && agentExistant === null && !chargementAgent) {
      chargerFicheAgent(utilisateur.idUtilisateur)
    }
  }

  async function handleEnregistrer() {
    setErreur('')
    setEnregistrement(true)
    try {
      if (role !== utilisateur.role) {
        await utilisateurApi.changerRole(utilisateur.idUtilisateur, role)
      }
      if (actif !== utilisateur.actif) {
        if (actif) {
          await utilisateurApi.activer(utilisateur.idUtilisateur)
        } else {
          await utilisateurApi.desactiver(utilisateur.idUtilisateur)
        }
      }
      if (role === ROLES.AGENT) {
        if (agentExistant) {
          await agentApi.modifier(agentExistant.idAgent, {
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            fonction,
            telephone: agentExistant.telephone,
          })
        } else {
          await agentApi.creer({
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            fonction,
            telephone: null,
            email: utilisateur.email,
            idUtilisateur: utilisateur.idUtilisateur,
          })
        }
      }
      onSaved()
    } catch (error) {
      setErreur(error.response?.data?.message || "Une erreur est survenue, veuillez réessayer")
    } finally {
      setEnregistrement(false)
    }
  }

  if (!utilisateur) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            border: '10px solid #16834d',
            borderRadius: '14px',
          },
        },
      }}
    >
      <DialogTitle sx={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700, color: '#0c5d7d' }}>
        Modifier l&apos;utilisateur
        <Typography sx={{ fontFamily: 'Quicksand, sans-serif', fontSize: 13, fontWeight: 500, color: 'text.secondary', mt: 0.5 }}>
          Mettez à jour les informations de l&apos;utilisateur.
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {erreur && <Alert severity="error">{erreur}</Alert>}

          <Stack direction="row" spacing={2}>
            <TextField label="Nom" value={utilisateur.nom} fullWidth disabled size="small" />
            <TextField label="Prénom" value={utilisateur.prenom} fullWidth disabled size="small" />
          </Stack>
          <TextField label="Email" value={utilisateur.email} fullWidth disabled size="small" />

          <Box>
            <Typography sx={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700, fontSize: 14, mb: 1 }}>
              Rôle
            </Typography>
            <Stack spacing={1}>
              {ROLES_ASSIGNABLES.map((option) => {
                const isSelected = role === option
                return (
                  <Box
                    key={option}
                    onClick={() => handleRoleClick(option)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: isSelected ? ROLE_COLORS[option] : 'divider',
                      bgcolor: isSelected ? `${ROLE_COLORS[option]}14` : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Chip
                      label={ROLE_LABELS[option]}
                      size="small"
                      icon={isSelected ? <CheckIcon sx={{ color: '#fff !important', fontSize: 15 }} /> : undefined}
                      sx={{
                        bgcolor: ROLE_COLORS[option],
                        color: '#fff',
                        fontWeight: 700,
                        fontFamily: 'Quicksand, sans-serif',
                      }}
                    />
                    <Typography sx={{ fontFamily: 'Quicksand, sans-serif', color: '#0c5d7d', fontSize: 14 }}>
                      {ROLE_LABELS[option]}
                    </Typography>
                  </Box>
                )
              })}
            </Stack>
          </Box>

          <Box>
            <TextField
              label="Fonction"
              value={fonction}
              onChange={(event) => setFonction(event.target.value)}
              fullWidth
              size="small"
              disabled={role !== ROLES.AGENT || chargementAgent}
              placeholder={chargementAgent ? 'Chargement...' : '—'}
              InputProps={{
                endAdornment: chargementAgent ? <CircularProgress size={16} /> : undefined,
              }}
            />
            <Typography sx={{ fontFamily: 'Quicksand, sans-serif', fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
              {role === ROLES.AGENT && !chargementAgent && !agentExistant
                ? "Aucune fiche agent associée - elle sera créée à l'enregistrement."
                : 'Visible uniquement si l\'utilisateur est un agent'}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700, fontSize: 14, mb: 0.5 }}>
              Statut du compte
            </Typography>
            <RadioGroup
              row
              value={actif ? 'actif' : 'inactif'}
              onChange={(event) => setActif(event.target.value === 'actif')}
            >
              <FormControlLabel value="actif" control={<Radio size="small" />} label="Actif" />
              <FormControlLabel value="inactif" control={<Radio size="small" />} label="Inactif" />
            </RadioGroup>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={enregistrement}
          sx={{ bgcolor: '#dc5e60', color: '#fff', textTransform: 'none', px: 3, '&:hover': { bgcolor: '#c95355' } }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleEnregistrer}
          disabled={enregistrement || chargementAgent}
          variant="contained"
          sx={{ bgcolor: '#146f42', textTransform: 'none', px: 3, '&:hover': { bgcolor: '#0f5a35' } }}
        >
          {enregistrement ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

//  Page principale 
export default function Liste() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreurChargement, setErreurChargement] = useState('')

  const [roleFilter, setRoleFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState('10')

  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState(null)
  const [modalOuvert, setModalOuvert] = useState(false)

  async function chargerUtilisateurs() {
    setLoading(true)
    setErreurChargement('')
    try {
      const response = await utilisateurApi.listerTous()
      setUtilisateurs(response.data)
    } catch {
      setErreurChargement('Impossible de charger la liste des utilisateurs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerUtilisateurs()
  }, [])

  const utilisateursFiltres = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return utilisateurs.filter((utilisateur) => {
      const matchRole = !roleFilter || utilisateur.role === roleFilter
      const matchRecherche =
        !query ||
        [
          utilisateur.idUtilisateur,
          utilisateur.nom,
          utilisateur.prenom,
          utilisateur.email,
          ROLE_LABELS[utilisateur.role],
        ]
          .filter(Boolean)
          .some((valeur) => String(valeur).toLowerCase().includes(query))
      return matchRole && matchRecherche
    })
  }, [utilisateurs, roleFilter, searchQuery])

  const parPage = Number(rowsPerPage)
  const nombrePages = Math.max(1, Math.ceil(utilisateursFiltres.length / parPage))
  const pageActuelle = Math.min(page, nombrePages)
  const utilisateursAffiches = utilisateursFiltres.slice(
    (pageActuelle - 1) * parPage,
    pageActuelle * parPage
  )

  function ouvrirModal(utilisateur) {
    setUtilisateurSelectionne(utilisateur)
    setModalOuvert(true)
  }

  function fermerModal() {
    setModalOuvert(false)
    setUtilisateurSelectionne(null)
  }

  function handleEnregistre() {
    fermerModal()
    chargerUtilisateurs()
  }

  return (
    <>
      <Box
        component="section"
        aria-labelledby="user-management-title"
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
            id="user-management-title"
            component="h2"
            sx={{ color: '#0c5d7d', fontSize: '24px', lineHeight: 1.2, fontWeight: 700 }}
          >
            Liste des utilisateurs
          </Typography>
          <Stack direction="row" spacing={1}>
            <FormControl size="small" sx={{ minWidth: 150, ...controlSx }}>
              <Select
                aria-label="Filtrer par rôle"
                displayEmpty
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value)
                  setPage(1)
                }}
                renderValue={(value) => (value ? ROLE_LABELS[value] : 'Filtrer par rôle')}
              >
                <MenuItem value="">Tous les rôles</MenuItem>
                {ROLES_ASSIGNABLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {ROLE_LABELS[role]}
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
              sx={{ width: { xs: 150, sm: 180 }, ...controlSx }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Rechercher..."
                  inputProps={{ ...params.inputProps, 'aria-label': 'Rechercher un utilisateur' }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <IconImg src={iconRecherche} size={14} sx={{ mr: 0.5 }} />,
                  }}
                />
              )}
            />
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
            aria-label="Liste des utilisateurs"
            sx={{
              minWidth: 760,
              tableLayout: 'fixed',
              '& .MuiTableCell-root': { borderBottom: 'none', color: '#0c5d7d', fontFamily: 'Quicksand, sans-serif', whiteSpace: 'nowrap' },
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: '#0c5d7d', height: 38 }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.label || 'actions'}
                    sx={{ width: column.width, px: 1.5, py: 0.75, color: '#fff !important', fontSize: '19px', fontWeight: 700, lineHeight: 1 }}
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
              ) : utilisateursAffiches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4, fontSize: 13 }}>
                    Aucun utilisateur trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                utilisateursAffiches.map((utilisateur, index) => (
                  <TableRow
                    key={utilisateur.idUtilisateur}
                    sx={{ height: 42, bgcolor: index % 2 === 0 ? '#fff' : '#f3f4f6' }}
                  >
                    <TableCell sx={{ px: 1.5, py: 0.75, fontSize: '18px', fontWeight: 600 }}>{utilisateur.idUtilisateur}</TableCell>
                    <TableCell sx={{ px: 1.5, py: 0.75, fontSize: '18px' }}>{utilisateur.nom}</TableCell>
                    <TableCell sx={{ px: 1.5, py: 0.75, fontSize: '18px' }}>{utilisateur.prenom}</TableCell>
                    <TableCell sx={{ px: 1.5, py: 0.75, fontSize: '18px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {utilisateur.email}
                    </TableCell>
                    <TableCell sx={{ px: 1.5, py: 0.75 }}>
                      <Chip
                        label={ROLE_LABELS[utilisateur.role]}
                        size="small"
                        sx={{
                          height: 20,
                          maxWidth: '100%',
                          bgcolor: ROLE_COLORS[utilisateur.role],
                          color: '#fff',
                          borderRadius: '999px',
                          fontFamily: 'Quicksand, sans-serif',
                          fontSize: '15px',
                          fontWeight: 700,
                          '& .MuiChip-label': { px: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ px: 1.5, py: 0.75 }}>
                      <Chip
                        label={utilisateur.actif ? 'Oui' : 'Non'}
                        size="small"
                        sx={{
                          height: 20,
                          bgcolor: utilisateur.actif ? '#1b7548' : '#9CA3AF',
                          color: '#fff',
                          borderRadius: '999px',
                          fontFamily: 'Quicksand, sans-serif',
                          fontSize: '15px',
                          fontWeight: 700,
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ px: 1.5, py: 0.75, fontSize: '18px' }}>
                      {formaterDate(utilisateur.dateCreation)}
                    </TableCell>
                    <TableCell align="center" sx={{ px: 0.5, py: 0.75 }}>
                      <Button
                        aria-label={`Modifier l'utilisateur ${utilisateur.idUtilisateur}`}
                        onClick={() => ouvrirModal(utilisateur)}
                        sx={{ minWidth: 0, p: 0.25, color: '#0c5d7d', '&:hover': { bgcolor: 'transparent' } }}
                      >
                        <IconImg src={iconModifier} size={17} />
                      </Button>
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
              sx={{ minWidth: 75, height: 30, px: 1, borderColor: 'rgba(13, 93, 125, 0.2)', borderRadius: '5px', color: '#0c5d7d', fontSize: '18px', fontWeight: 600, textTransform: 'none' }}
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
                  fontSize: '11px',
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
              sx={{ minWidth: 65, height: 30, px: 1, borderColor: 'rgba(13, 93, 125, 0.2)', borderRadius: '5px', color: '#0c5d7d', fontSize: '11px', fontWeight: 600, textTransform: 'none' }}
            >
              Suivant
            </Button>
          </Stack>
        </Stack>
      </Box>

      <ModifierUtilisateurModal
        utilisateur={utilisateurSelectionne}
        open={modalOuvert}
        onClose={fermerModal}
        onSaved={handleEnregistre}
      />
    </>
  )
}