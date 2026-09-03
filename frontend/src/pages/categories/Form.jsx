/*

Nom du fichier   : Form.jsx
Objectif         : Modal de creation/modification d'une categorie, fidele a la
                    maquette Figma (Add-Categorie-Parc). Rendu depuis Liste.jsx,
                    pas une route dediee (voir note dans AppRoutes.jsx a nettoyer :
                    /parc/categories/nouveau pointait vers ce fichier avant qu'il
                    ne devienne un modal).
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026

*/

import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { categorieApi } from '../../api/categorieApi'
import { TYPE_CATEGORIE, TYPE_CATEGORIE_LABELS } from '../../utils/constants'

const TYPES_DISPONIBLES = [
  TYPE_CATEGORIE.HARDWARE,
  TYPE_CATEGORIE.SOFTWARE,
  TYPE_CATEGORIE.RESEAU,
  TYPE_CATEGORIE.AUTRE,
]

export default function CategorieFormModal({ open, categorie, onClose, onSaved }) {
  const modeEdition = Boolean(categorie)

  const [libelle, setLibelle] = useState('')
  const [type, setType] = useState(TYPE_CATEGORIE.HARDWARE)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    if (open) {
      setLibelle(categorie?.libelle || '')
      setType(categorie?.type || TYPE_CATEGORIE.HARDWARE)
      setErreur('')
    }
  }, [open, categorie])

  async function handleEnregistrer() {
    if (!libelle.trim()) {
      setErreur('Le libellé est obligatoire.')
      return
    }
    setErreur('')
    setEnregistrement(true)
    try {
      const payload = { libelle: libelle.trim(), type }
      if (modeEdition) {
        await categorieApi.modifier(categorie.idCategorie, payload)
        onSaved('Catégorie modifiée avec succès.')
      } else {
        await categorieApi.creer(payload)
        onSaved('Catégorie créée avec succès.')
      }
    } catch (error) {
      setErreur(error.response?.data?.message || "Une erreur est survenue, veuillez réessayer.")
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700, color: '#0c5d7d' }}>
        Informations sur catégorie
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {erreur && <Alert severity="error">{erreur}</Alert>}

          <Stack spacing={0.5}>
            <Typography sx={{ fontFamily: 'Quicksand, sans-serif', fontSize: 13, fontWeight: 700, color: '#0c5d7d' }}>
              Libellé de la catégorie (Nom exact)
            </Typography>
            <TextField
              value={libelle}
              onChange={(event) => setLibelle(event.target.value)}
              fullWidth
              size="small"
              placeholder="ex: Equipements Matériels"
            />
          </Stack>

          <Stack spacing={0.5}>
            <Typography sx={{ fontFamily: 'Quicksand, sans-serif', fontSize: 13, fontWeight: 700, color: '#0c5d7d' }}>
              Type de la catégorie
            </Typography>
            <Select
              value={type}
              onChange={(event) => setType(event.target.value)}
              size="small"
              fullWidth
            >
              {TYPES_DISPONIBLES.map((valeur) => (
                <MenuItem key={valeur} value={valeur}>
                  {TYPE_CATEGORIE_LABELS[valeur]}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={enregistrement} sx={{ textTransform: 'none', fontWeight: 700 }}>
          Annuler
        </Button>
        <Button
          onClick={handleEnregistrer}
          disabled={enregistrement}
          variant="contained"
          sx={{
            bgcolor: '#dc5e60',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '8px',
            px: 3,
            '&:hover': { bgcolor: '#c95355' },
          }}
        >
          {modeEdition ? 'Enregistrer' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}