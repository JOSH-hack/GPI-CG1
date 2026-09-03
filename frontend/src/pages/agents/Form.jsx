/*

Nom du fichier   : Form.jsx
Objectif         : Creation ou modification d'une fiche agent - champs de base + liaison optionnelle a un compte utilisateur existant
Propriétaire     : Josué BEDEL
Date de création : 03/09/2026

*/

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { agentApi } from '../../api/agentApi'
import { utilisateurApi } from '../../api/utilisateurApi'
import backgroundPic from '../../assets/background/backgroundpic.png'

export default function Form() {
  const navigate = useNavigate()
  const { id } = useParams()
  const modeEdition = Boolean(id)

  const [valeurs, setValeurs] = useState({ nom: '', prenom: '', fonction: '', telephone: '', email: '' })
  const [utilisateurLie, setUtilisateurLie] = useState(null)
  const [optionsUtilisateurs, setOptionsUtilisateurs] = useState([])

  const [chargementInitial, setChargementInitial] = useState(modeEdition)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    utilisateurApi
      .listerTous()
      .then((response) => setOptionsUtilisateurs(response.data))
      .catch(() => setOptionsUtilisateurs([]))
  }, [])

  useEffect(() => {
    if (!modeEdition) return

    agentApi
      .getParId(id)
      .then((response) => {
        const agent = response.data
        setValeurs({
          nom: agent.nom,
          prenom: agent.prenom,
          fonction: agent.fonction || '',
          telephone: agent.telephone || '',
          email: agent.utilisateur?.email || '',
        })
        setUtilisateurLie(agent.utilisateur || null)
      })
      .catch(() => setErreur("Impossible de charger la fiche de cet agent."))
      .finally(() => setChargementInitial(false))
  }, [id, modeEdition])

  function handleChange(champ) {
    return (event) => setValeurs((precedent) => ({ ...precedent, [champ]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErreur('')
    setEnregistrement(true)

    const payload = {
      nom: valeurs.nom,
      prenom: valeurs.prenom,
      fonction: valeurs.fonction,
      telephone: valeurs.telephone || null,
      email: valeurs.email || utilisateurLie?.email || null,
      idUtilisateur: utilisateurLie?.idUtilisateur || null,
    }

    try {
      if (modeEdition) {
        await agentApi.modifier(id, payload)
      } else {
        await agentApi.creer(payload)
      }
      navigate('/gestion/agents')
    } catch (error) {
      setErreur(error.response?.data?.message || "Une erreur est survenue, veuillez réessayer")
    } finally {
      setEnregistrement(false)
    }
  }

  if (chargementInitial) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
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
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${backgroundPic})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography sx={{ color: '#0c5d7d', fontSize: '24px', fontWeight: 700, mb: 2 }}>
          {modeEdition ? "Modifier l'agent" : 'Nouvel agent'}
        </Typography>

        <Paper sx={{ p: 3, maxWidth: 560, border: '2px solid #146f42', borderRadius: '9px' }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {erreur && <Alert severity="error">{erreur}</Alert>}

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Nom"
                  value={valeurs.nom}
                  onChange={handleChange('nom')}
                  required
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Prénom"
                  value={valeurs.prenom}
                  onChange={handleChange('prenom')}
                  required
                  fullWidth
                  size="small"
                />
              </Stack>

              <TextField
                label="Fonction"
                value={valeurs.fonction}
                onChange={handleChange('fonction')}
                fullWidth
                size="small"
              />

              <TextField
                label="Téléphone"
                value={valeurs.telephone}
                onChange={handleChange('telephone')}
                fullWidth
                size="small"
              />

              <TextField
                label="Email de contact"
                type="email"
                value={valeurs.email}
                onChange={handleChange('email')}
                fullWidth
                size="small"
                disabled={Boolean(utilisateurLie)}
                helperText={
                  utilisateurLie
                    ? 'Email issu du compte utilisateur lié - non modifiable ici'
                    : "Renseigne si l'agent n'a pas encore de compte utilisateur"
                }
              />

              <Autocomplete
                options={optionsUtilisateurs}
                value={utilisateurLie}
                onChange={(_, nouvelleValeur) => {
                  setUtilisateurLie(nouvelleValeur)
                  if (nouvelleValeur) {
                    setValeurs((precedent) => ({ ...precedent, email: nouvelleValeur.email }))
                  }
                }}
                getOptionLabel={(option) => `${option.nom} ${option.prenom} (${option.email})`}
                isOptionEqualToValue={(option, value) => option.idUtilisateur === value.idUtilisateur}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Compte utilisateur associé (optionnel)"
                    size="small"
                    helperText="Laissez vide si cet agent n'a pas encore de compte"
                  />
                )}
              />

              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button onClick={() => navigate('/gestion/agents')} disabled={enregistrement}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={enregistrement}
                  sx={{ bgcolor: '#146f42', '&:hover': { bgcolor: '#0f5a35' } }}
                >
                  {enregistrement ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Enregistrer'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}