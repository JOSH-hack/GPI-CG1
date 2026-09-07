/*

Nom du fichier   : Liste.jsx
Objectif         : Page Gestion des categories d'equipements - fidele a la maquette
                    Figma (Add-Categorie-Parc / Categorie-Parc). Contenu seul,
                    Sidebar + Navbar fournis par DashboardLayout. Filtre par type
                    (HARDWARE/SOFTWARE/RESEAU/AUTRE), creation/modification via
                    modal, suppression avec confirmation (bloquee cote backend si
                    des equipements utilisent encore la categorie).
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026

*/

import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import backgroundPic from '../../assets/background/backgroundpic.png'
import {
  Alert,
  Box,
  Button,
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


import ConfirmDialog from '../../components/common/ConfirmDialog'
import CategorieFormModal from './Form'
import { categorieApi } from '../../api/categorieApi'
import { TYPE_CATEGORIE, TYPE_CATEGORIE_LABELS, TYPE_CATEGORIE_COLORS } from '../../utils/constants'

const TYPES_FILTRABLES = [
  TYPE_CATEGORIE.HARDWARE,
  TYPE_CATEGORIE.SOFTWARE,
  TYPE_CATEGORIE.RESEAU,
  TYPE_CATEGORIE.AUTRE,
]

export default function Liste() {
  const [categories, setCategories] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const [typeFilter, setTypeFilter] = useState('')

  const [modalOuvert, setModalOuvert] = useState(false)
  const [categorieEnEdition, setCategorieEnEdition] = useState(null)

  const [categorieASupprimer, setCategorieASupprimer] = useState(null)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)
  const [erreurSuppression, setErreurSuppression] = useState('')

  async function chargerCategories() {
    setChargement(true)
    setErreur('')
    try {
      const response = typeFilter
        ? await categorieApi.listerParType(typeFilter)
        : await categorieApi.listerToutes()
      setCategories(response.data)
    } catch {
      setErreur('Impossible de charger la liste des catégories.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    chargerCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter])

  const categoriesTriees = useMemo(
    () => [...categories].sort((a, b) => a.libelle.localeCompare(b.libelle)),
    [categories]
  )

  function ouvrirCreation() {
    setCategorieEnEdition(null)
    setModalOuvert(true)
  }

  function ouvrirModification(categorie) {
    setCategorieEnEdition(categorie)
    setModalOuvert(true)
  }

  function fermerModal() {
    setModalOuvert(false)
    setCategorieEnEdition(null)
  }

  function handleEnregistre(message) {
    fermerModal()
    setSucces(message)
    chargerCategories()
  }

  function demanderSuppression(categorie) {
    setErreurSuppression('')
    setCategorieASupprimer(categorie)
  }

  async function confirmerSuppression() {
    setSuppressionEnCours(true)
    setErreurSuppression('')
    try {
      await categorieApi.supprimer(categorieASupprimer.idCategorie)
      setCategorieASupprimer(null)
      setSucces('Catégorie supprimée avec succès.')
      chargerCategories()
    } catch (error) {
      // Le backend bloque la suppression si des equipements utilisent encore
      // cette categorie (BusinessRuleException, 400) - message affiche direct
      // dans la boite de dialogue plutot que de la fermer silencieusement.
      setErreurSuppression(
        error.response?.data?.message || 'Impossible de supprimer cette catégorie.'
      )
    } finally {
      setSuppressionEnCours(false)
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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Typography sx={{ color: '#0c5d7d', fontSize: { xs: 22, md: 28 }, fontWeight: 700, lineHeight: 1.2 }}>
          Liste des catégories existantes
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <FormControl
            size="small"
            sx={{
              minWidth: 170,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fff',
                borderRadius: '8px',
                fontFamily: 'Quicksand, sans-serif',
              },
            }}
          >
            <Select
              displayEmpty
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              renderValue={(value) => (value ? TYPE_CATEGORIE_LABELS[value] : 'Filtrer par type')}
            >
              <MenuItem value="">Tous les types</MenuItem>
              {TYPES_FILTRABLES.map((type) => (
                <MenuItem key={type} value={type}>
                  {TYPE_CATEGORIE_LABELS[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            startIcon={<AddIcon />}
            onClick={ouvrirCreation}
            variant="contained"
            sx={{
              bgcolor: '#0c5d7d',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              '&:hover': { bgcolor: '#094a63' },
            }}
          >
            Ajouter
          </Button>
        </Stack>
      </Stack>

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

      <TableContainer sx={{ border: '2px solid #146f42', borderRadius: '9px', overflowX: 'auto', bgcolor: '#fff' }}>
        <Table
          size="small"
          aria-label="Liste des catégories"
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
              {['Type', 'Libellé', ''].map((colonne) => (
                <TableCell
                  key={colonne || 'actions'}
                  sx={{ px: 1.5, py: 0.75, color: '#fff !important', fontSize: 13, fontWeight: 700 }}
                >
                  {colonne}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {chargement ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : categoriesTriees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, fontSize: 13 }}>
                  Aucune catégorie trouvée.
                </TableCell>
              </TableRow>
            ) : (
              categoriesTriees.map((categorie, index) => (
                <TableRow
                  key={categorie.idCategorie}
                  sx={{ height: 44, bgcolor: index % 2 === 0 ? '#fff' : '#f3f4f6' }}
                >
                  <TableCell sx={{ px: 1.5 }}>
                    <Chip
                      label={TYPE_CATEGORIE_LABELS[categorie.type]}
                      size="small"
                      sx={{
                        height: 22,
                        bgcolor: TYPE_CATEGORIE_COLORS[categorie.type],
                        color: '#fff',
                        fontWeight: 700,
                        fontFamily: 'Quicksand, sans-serif',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ px: 1.5, fontSize: 14 }}>{categorie.libelle}</TableCell>
                  <TableCell align="right" sx={{ px: 1.5 }}>
                    <Button
                      aria-label={`Modifier la catégorie ${categorie.libelle}`}
                      onClick={() => ouvrirModification(categorie)}
                      sx={{ minWidth: 0, p: 0.5, color: '#0c5d7d' }}
                    >
                      <EditIcon sx={{ fontSize: 18 }} />
                    </Button>
                    <Button
                      aria-label={`Supprimer la catégorie ${categorie.libelle}`}
                      onClick={() => demanderSuppression(categorie)}
                      sx={{ minWidth: 0, p: 0.5, color: '#dc5e60' }}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CategorieFormModal
        open={modalOuvert}
        categorie={categorieEnEdition}
        onClose={fermerModal}
        onSaved={handleEnregistre}
      />

      <ConfirmDialog
        open={Boolean(categorieASupprimer)}
        title="Supprimer la catégorie"
        message={
          erreurSuppression ||
          `Voulez-vous vraiment supprimer la catégorie "${categorieASupprimer?.libelle}" ? Cette action est irréversible.`
        }
        confirmLabel="Supprimer"
        confirmColor="error"
        loading={suppressionEnCours}
        onCancel={() => {
          setCategorieASupprimer(null)
          setErreurSuppression('')
        }}
        onConfirm={confirmerSuppression}
      />
    </Box>
  )
}