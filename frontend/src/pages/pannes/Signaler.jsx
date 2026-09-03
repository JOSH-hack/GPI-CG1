/*

Nom du fichier   : Signaler.jsx
Objectif         : Formulaire de signalement de panne (vue Agent) - fidele a la
                    maquette Anima "Assistance-Creation de tickets". Recherche
                    parmi le materiel attribue a l'agent, description, priorite,
                    photo optionnelle (uploadee juste apres la creation de la panne,
                    car FileUpload.jsx exige un idPanne deja existant)
Propriétaire     : Josué BEDEL
Date de création : 03/09/2026

*/

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SendIcon from '@mui/icons-material/Send'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'

import backgroundPic from '../../assets/background/backgroundpic.png'
import { equipementApi } from '../../api/equipementApi'
import { panneApi } from '../../api/panneApi'
import { pieceJointeApi } from '../../api/pieceJointeApi'
import { PRIORITE_PANNE, PRIORITE_PANNE_LABELS, TYPE_PIECE_JOINTE } from '../../utils/constants'

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

const COULEURS_PRIORITE = {
  [PRIORITE_PANNE.FAIBLE]: '#9CA3AF',
  [PRIORITE_PANNE.MOYENNE]: '#e6a817',
  [PRIORITE_PANNE.ELEVEE]: '#dc5e60',
  [PRIORITE_PANNE.CRITIQUE]: '#c0392b',
}

const EXTENSIONS_ACCEPTEES = ['image/png', 'image/jpeg', 'image/jpg']
const TAILLE_MAX_OCTETS = 10 * 1024 * 1024

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '8px', fontFamily: 'Quicksand, sans-serif' },
  '& .MuiInputLabel-root': { fontFamily: 'Quicksand, sans-serif' },
}

const cardSx = { p: 2.5, borderRadius: '12px', bgcolor: '#fff', border: '2px solid #146f42' }

export default function Signaler() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const inputFichierRef = useRef(null)

  const [equipements, setEquipements] = useState([])
  const [chargementEquipements, setChargementEquipements] = useState(true)
  const [equipementChoisi, setEquipementChoisi] = useState(null)
  const [description, setDescription] = useState('')
  const [priorite, setPriorite] = useState(PRIORITE_PANNE.MOYENNE)
  const [fichier, setFichier] = useState(null)
  const [erreurFichier, setErreurFichier] = useState('')
  const [glisseActif, setGlisseActif] = useState(false)

  const [erreursChamps, setErreursChamps] = useState({})
  const [envoi, setEnvoi] = useState(false)
  const [erreurServeur, setErreurServeur] = useState('')

  useEffect(() => {
    async function chargerEquipements() {
      setChargementEquipements(true)
      try {
        const response = await equipementApi.monMateriel()
        setEquipements(response.data)
      } catch {
        setErreurServeur("Impossible de charger votre matériel.")
      } finally {
        setChargementEquipements(false)
      }
    }
    chargerEquipements()
  }, [])

  function libelleEquipement(equipement) {
    if (!equipement) return ''
    const marqueModele = [equipement.marque, equipement.modele].filter(Boolean).join(' ')
    return `${equipement.codeInventaire} — ${marqueModele || equipement.nom}`
  }

  function traiterFichier(file) {
    setErreurFichier('')
    if (!EXTENSIONS_ACCEPTEES.includes(file.type)) {
      setErreurFichier('Format non accepté. Utilisez une image PNG, JPG ou JPEG.')
      return
    }
    if (file.size > TAILLE_MAX_OCTETS) {
      setErreurFichier('Le fichier dépasse la taille maximale autorisée (10 Mo).')
      return
    }
    setFichier(file)
  }

  function handleDrop(event) {
    event.preventDefault()
    setGlisseActif(false)
    const file = event.dataTransfer.files?.[0]
    if (file) traiterFichier(file)
  }

  function handleSelectionFichier(event) {
    const file = event.target.files?.[0]
    if (file) traiterFichier(file)
    event.target.value = ''
  }

  function valider() {
    const erreurs = {}
    if (!equipementChoisi) erreurs.equipement = "Sélectionnez l'équipement concerné"
    if (!description.trim()) erreurs.description = 'La description est obligatoire'
    setErreursChamps(erreurs)
    return Object.keys(erreurs).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErreurServeur('')
    if (!valider()) return

    setEnvoi(true)
    try {
      const response = await panneApi.signaler({
        idEquipement: equipementChoisi.idEquipement,
        description: description.trim(),
        priorite,
      })
      const nouvellePanne = response.data

      if (fichier) {
        try {
          await pieceJointeApi.upload(fichier, nouvellePanne.idPanne, TYPE_PIECE_JOINTE.IMAGE)
        } catch {
          // La panne est deja creee - on ne bloque pas l'utilisateur pour
          // un echec d'upload, juste un avertissement
          setErreurServeur(
            'La panne a bien été signalée, mais la photo n’a pas pu être envoyée. Vous pourrez la rajouter depuis le suivi du ticket.'
          )
        }
      }

      navigate('/assistance/mes-signalements')
    } catch (error) {
      setErreurServeur(error.response?.data?.message || 'Une erreur est survenue, veuillez réessayer.')
    } finally {
      setEnvoi(false)
    }
  }

  const dateDuJour = new Date().toLocaleDateString('fr-FR')

  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        minHeight: '100%',
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
      <Typography sx={{ color: '#0c5d7d', fontSize: 22, fontWeight: 700 }}>Signalement de panne</Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 2 }}>
        Créez un nouveau signalement de panne
      </Typography>

      <Alert severity="success" icon={false} sx={{ mb: 2.5, bgcolor: 'rgba(27, 117, 72, 0.08)', color: '#146f42', maxWidth: 900 }}>
        La panne sera signalée par {user?.nom || '…'}
      </Alert>

      <Stack
        component="form"
        onSubmit={handleSubmit}
        direction={{ xs: 'column', md: 'row' }}
        spacing={2.5}
        sx={{ maxWidth: 900 }}
      >
        <Stack spacing={2.5} sx={{ flex: 1.6, minWidth: 0 }}>
          {erreurServeur && <Alert severity="error">{erreurServeur}</Alert>}

          <Paper elevation={0} sx={cardSx}>
            <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 15, mb: 1 }}>
              Équipement concerné *
            </Typography>
            <Autocomplete
              options={equipements}
              loading={chargementEquipements}
              value={equipementChoisi}
              onChange={(_, value) => {
                setEquipementChoisi(value)
                if (value && erreursChamps.equipement) {
                  setErreursChamps((current) => ({ ...current, equipement: '' }))
                }
              }}
              getOptionLabel={libelleEquipement}
              isOptionEqualToValue={(option, value) => option.idEquipement === value.idEquipement}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Rechercher un équipement..."
                  error={Boolean(erreursChamps.equipement)}
                  helperText={erreursChamps.equipement || 'Recherchez par nom ou numéro de série'}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        <QrCodeScannerIcon sx={{ color: '#0c5d7d', mr: 1 }} />
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={fieldSx}
                />
              )}
            />
          </Paper>

          <Paper elevation={0} sx={cardSx}>
            <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 15, mb: 1 }}>
              Description de la panne *
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={4}
              placeholder="Décrivez le problème rencontré..."
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                if (erreursChamps.description) {
                  setErreursChamps((current) => ({ ...current, description: '' }))
                }
              }}
              error={Boolean(erreursChamps.description)}
              helperText={erreursChamps.description}
              sx={fieldSx}
            />
          </Paper>

          <Paper elevation={0} sx={cardSx}>
            <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 15, mb: 1 }}>
              Photo de la panne
            </Typography>
            <Box
              onDragOver={(event) => {
                event.preventDefault()
                setGlisseActif(true)
              }}
              onDragLeave={() => setGlisseActif(false)}
              onDrop={handleDrop}
              sx={{
                border: '2px dashed',
                borderColor: glisseActif ? '#146f42' : 'rgba(13, 93, 125, 0.25)',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                bgcolor: glisseActif ? 'rgba(20, 111, 66, 0.06)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 36, color: '#146f42', mb: 1 }} />
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>
                Glissez une photo de la panne ici, ou
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => inputFichierRef.current?.click()}
                sx={{ bgcolor: '#146f42', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#0f5a35' } }}
              >
                Parcourir
              </Button>
              <input
                ref={inputFichierRef}
                type="file"
                hidden
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleSelectionFichier}
              />
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                PNG, JPG, JPEG jusqu'à 10 Mo
              </Typography>
              {fichier && (
                <Chip
                  label={fichier.name}
                  onDelete={() => setFichier(null)}
                  sx={{ mt: 1.5, fontFamily: 'Quicksand, sans-serif' }}
                />
              )}
            </Box>
            {erreurFichier && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {erreurFichier}
              </Alert>
            )}
          </Paper>
        </Stack>

        <Stack spacing={2.5} sx={{ flex: 1, minWidth: { md: 260 } }}>
          <Paper elevation={0} sx={cardSx}>
            <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 15, mb: 2 }}>Panne</Typography>

            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5, mb: 0.5 }}>
              DATE DE SIGNALEMENT
            </Typography>
            <TextField fullWidth size="small" value={dateDuJour} disabled sx={{ mb: 2, ...fieldSx }} />

            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5, mb: 0.5 }}>
              PRIORITÉ
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2, ...fieldSx }}>
              <Select value={priorite} onChange={(event) => setPriorite(event.target.value)}>
                {Object.values(PRIORITE_PANNE).map((valeur) => (
                  <MenuItem key={valeur} value={valeur}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COULEURS_PRIORITE[valeur] }} />
                      <span>{PRIORITE_PANNE_LABELS[valeur]}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5, mb: 0.5 }}>
              STATUT
            </Typography>
            <Chip
              label="Signalée"
              size="small"
              sx={{ bgcolor: '#0c5d7d', color: '#fff', fontWeight: 700, fontFamily: 'Quicksand, sans-serif', mb: 1 }}
            />
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
              Le statut sera automatiquement mis à jour par le technicien assigné.
            </Typography>
          </Paper>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ maxWidth: 900, mt: 2.5 }}>
        <Button
          onClick={() => navigate(-1)}
          disabled={envoi}
          sx={{ bgcolor: '#dc5e60', color: '#fff', textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#c95355' } }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={envoi}
          variant="contained"
          startIcon={!envoi && <SendIcon />}
          sx={{ bgcolor: '#146f42', textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#0f5a35' } }}
        >
          {envoi ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Signaler la panne'}
        </Button>
      </Stack>
    </Box>
  )
}