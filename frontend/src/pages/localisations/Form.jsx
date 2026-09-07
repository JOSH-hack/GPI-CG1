/*

Nom du fichier   : Form.jsx
Objectif         : Formulaire de creation/edition d'une localisation - meme
                    composant pour les deux cas, determine par la presence
                    d'un :id dans l'URL
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026

*/

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import backgroundPic from '../../assets/background/backgroundpic.png'
import { localisationApi } from '../../api/localisationApi'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

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

const CHAMPS_VIDES = { annexe: '', service: '', bureau: '', poste: '' }

export default function Form() {
  const { id } = useParams()
  const navigate = useNavigate()
  const modeEdition = Boolean(id)

  const [valeurs, setValeurs] = useState(CHAMPS_VIDES)
  const [erreursChamps, setErreursChamps] = useState({})
  const [chargement, setChargement] = useState(modeEdition)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreurServeur, setErreurServeur] = useState('')

  useEffect(() => {
    if (!modeEdition) return

    async function chargerLocalisation() {
      setChargement(true)
      setErreurServeur('')
      try {
        const response = await localisationApi.getParId(id)
        const { annexe, service, bureau, poste } = response.data
        setValeurs({ annexe, service, bureau: bureau || '', poste: poste || '' })
      } catch {
        setErreurServeur("Impossible de charger cette localisation.")
      } finally {
        setChargement(false)
      }
    }

    chargerLocalisation()
  }, [id, modeEdition])

  function handleChange(event) {
    const { name, value } = event.target
    setValeurs((current) => ({ ...current, [name]: value }))
    if (erreursChamps[name]) {
      setErreursChamps((current) => ({ ...current, [name]: '' }))
    }
  }

  function valider() {
    const erreurs = {}
    if (!valeurs.annexe.trim()) erreurs.annexe = "L'annexe est obligatoire"
    if (!valeurs.service.trim()) erreurs.service = 'Le service est obligatoire'
    setErreursChamps(erreurs)
    return Object.keys(erreurs).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErreurServeur('')
    if (!valider()) return

    setEnregistrement(true)
    const payload = {
      annexe: valeurs.annexe.trim(),
      service: valeurs.service.trim(),
      bureau: valeurs.bureau.trim() || null,
      poste: valeurs.poste.trim() || null,
    }

    try {
      if (modeEdition) {
        await localisationApi.modifier(id, payload)
      } else {
        await localisationApi.creer(payload)
      }
      navigate('/gestion/localisations')
    } catch (error) {
      setErreurServeur(
        error.response?.data?.message || "Une erreur est survenue, veuillez réessayer."
      )
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        minHeight: '100%',
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
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Button
          onClick={() => navigate('/gestion/localisations')}
          startIcon={<ArrowBackIcon />}
          sx={{ color: '#0c5d7d', textTransform: 'none', fontFamily: 'Quicksand, sans-serif', fontWeight: 700 }}
        >
          Retour
        </Button>
      </Stack>

      <Typography sx={{ color: '#0c5d7d', fontSize: 24, fontWeight: 700, mb: 2 }}>
        {modeEdition ? 'Modifier la localisation' : 'Nouvelle localisation'}
      </Typography>

      <Paper
        elevation={0}
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 560,
          p: 3,
          borderRadius: '12px',
          bgcolor: '#fff',
          boxShadow: '0 4px 12px rgba(12, 93, 125, 0.12)',
        }}
      >
        {chargement ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            {erreurServeur && <Alert severity="error">{erreurServeur}</Alert>}

            <TextField
              name="annexe"
              label="Annexe"
              value={valeurs.annexe}
              onChange={handleChange}
              error={Boolean(erreursChamps.annexe)}
              helperText={erreursChamps.annexe}
              fullWidth
              required
              sx={fieldSx}
            />

            <TextField
              name="service"
              label="Service"
              value={valeurs.service}
              onChange={handleChange}
              error={Boolean(erreursChamps.service)}
              helperText={erreursChamps.service}
              fullWidth
              required
              sx={fieldSx}
            />

            <TextField
              name="bureau"
              label="Bureau"
              value={valeurs.bureau}
              onChange={handleChange}
              fullWidth
              sx={fieldSx}
            />

            <TextField
              name="poste"
              label="Poste"
              value={valeurs.poste}
              onChange={handleChange}
              fullWidth
              sx={fieldSx}
            />

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button
                onClick={() => navigate('/gestion/localisations')}
                disabled={enregistrement}
                sx={{ bgcolor: '#dc5e60', color: '#fff', textTransform: 'none', px: 3, '&:hover': { bgcolor: '#c95355' } }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={enregistrement}
                variant="contained"
                sx={{ bgcolor: '#146f42', textTransform: 'none', px: 3, '&:hover': { bgcolor: '#0f5a35' } }}
              >
                {enregistrement ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Enregistrer'}
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Box>
  )
}