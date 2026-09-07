/*

Nom du fichier   : Signaler.jsx
Objectif         : Formulaire de signalement de panne (vue Agent) - reproduction
                    fidele de l'export Anima "IncidentReportFormSection" fourni
                    par Josue. Sidebar/Navbar retires (fournis par DashboardLayout).
                    Donnees reelles branchees : recherche parmi le materiel attribue
                    a l'agent (equipementApi.monMateriel), priorite reelle
                    (PRIORITE_PANNE, la maquette n'exposait que "Moyenne" en dur),
                    photo uploadee juste apres la creation de la panne
                    (FileUpload.jsx exige un idPanne deja existant, indisponible
                    au moment de la selection du fichier)
Propriétaire     : Josué BEDEL
Date de création : 03/09/2026

*/

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined'
import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import ExpandMore from '@mui/icons-material/ExpandMore'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import SearchOutlined from '@mui/icons-material/SearchOutlined'
import UploadOutlined from '@mui/icons-material/UploadOutlined'
import backgroundPic from '../../assets/background/backgroundpic.png'

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { useAuth } from '../../contexts/AuthContext'
import { equipementApi } from '../../api/equipementApi'
import { panneApi } from '../../api/panneApi'
import { pieceJointeApi } from '../../api/pieceJointeApi'
import { PRIORITE_PANNE, PRIORITE_PANNE_LABELS, TYPE_PIECE_JOINTE } from '../../utils/constants'

const COULEURS_PRIORITE = {
  [PRIORITE_PANNE.FAIBLE]: '#9ca3af',
  [PRIORITE_PANNE.MOYENNE]: '#f59e0b',
  [PRIORITE_PANNE.ELEVEE]: '#dc5e60',
  [PRIORITE_PANNE.CRITIQUE]: '#c0392b',
}

const EXTENSIONS_ACCEPTEES = ['image/png', 'image/jpeg', 'image/jpg']
const TAILLE_MAX_OCTETS = 10 * 1024 * 1024

export default function Signaler() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [equipements, setEquipements] = useState([])
  const [chargementEquipements, setChargementEquipements] = useState(true)
  const [equipement, setEquipement] = useState(null)
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(PRIORITE_PANNE.MOYENNE)
  const [selectedFile, setSelectedFile] = useState(null)
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
        setErreurServeur('Impossible de charger votre matériel.')
      } finally {
        setChargementEquipements(false)
      }
    }
    chargerEquipements()
  }, [])

  function libelleEquipement(item) {
    if (!item) return ''
    const marqueModele = [item.marque, item.modele].filter(Boolean).join(' ')
    return `${item.codeInventaire} — ${marqueModele || item.nom}`
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
    setSelectedFile(file)
  }

  function handleFileChange(event) {
    const [file] = event.target.files
    if (file) traiterFichier(file)
    event.target.value = ''
  }

  function handleDrop(event) {
    event.preventDefault()
    setGlisseActif(false)
    const file = event.dataTransfer.files?.[0]
    if (file) traiterFichier(file)
  }

  function valider() {
    const erreurs = {}
    if (!equipement) erreurs.equipement = "Sélectionnez l'équipement concerné"
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
        idEquipement: equipement.idEquipement,
        description: description.trim(),
        priorite: priority,
      })
      const nouvellePanne = response.data

      if (selectedFile) {
        try {
          await pieceJointeApi.upload(selectedFile, nouvellePanne.idPanne, TYPE_PIECE_JOINTE.IMAGE)
        } catch {
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
      aria-labelledby="incident-report-title"
      sx={{
        width: '100%',
                       minHeight: '100%',
                       backgroundImage: `linear-gradient(rgba(204, 204, 204, 0.6), rgba(231, 230, 230, 0.8)), url(${backgroundPic})`,
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
      <Stack spacing={2.5}>
        <Box component="header">
          <Typography
            id="incident-report-title"
            component="h1"
            sx={{ color: '#0c5d7d', fontSize: '39px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '1px' }}
          >
            Signalement de panne
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.25, fontSize: '19px', lineHeight: 1.3, fontWeight: 600 }}>
            Créez un nouveau signalement de panne
          </Typography>
        </Box>

        <Grid container spacing={2.5} alignItems="flex-start">
          <Grid item xs={12} md={8.7}>
            <Stack component="form" onSubmit={handleSubmit} spacing={2.25}>
              <Alert
                icon={<InfoOutlined fontSize="small" />}
                severity="success"
                sx={{
                  py: 0.5,
                  px: 1.25,
                  border: '3px solid #a5d6a7',
                  borderRadius: 1,
                  backgroundColor: '#e8f5e9',
                  color: '#1b4d2e',
                  '& .MuiAlert-icon': { color: '#1b7548', alignItems: 'center', mr: 1 },
                  '& .MuiAlert-message': { py: 0, fontSize: '18px', fontWeight: 500 },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                La panne sera signalée par {user?.nom || '…'}
              </Alert>

              {erreurServeur && <Alert severity="error">{erreurServeur}</Alert>}

              <Stack spacing={0.75}>
                <Typography
                  component="label"
                  htmlFor="equipment-search"
                  sx={{ color: '#4b5563', fontSize: '18px', fontWeight: 600 }}
                >
                  Équipement concerné{' '}
                  <Box component="span" sx={{ color: '#dc5e60' }}>*</Box>
                </Typography>
                <Autocomplete
                  id="equipment-search"
                  options={equipements}
                  loading={chargementEquipements}
                  value={equipement}
                  onChange={(_, value) => {
                    setEquipement(value)
                    if (value && erreursChamps.equipement) {
                      setErreursChamps((current) => ({ ...current, equipement: '' }))
                    }
                  }}
                  getOptionLabel={libelleEquipement}
                  isOptionEqualToValue={(option, value) => option.idEquipement === value.idEquipement}
                  popupIcon={null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Rechercher un équipement..."
                      error={Boolean(erreursChamps.equipement)}
                      inputProps={{ ...params.inputProps, 'aria-label': 'Rechercher un équipement' }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchOutlined sx={{ color: '#9ca3af', fontSize: 28, marginLeft: 2.5 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end" sx={{ mr: -1.5 }}>
                            {chargementEquipements && <CircularProgress size={16} sx={{ mr: 1 }} />}
                            <Button
                              type="button"
                              aria-label="Scanner le QR code"
                              variant="contained"
                              disableElevation
                              sx={{
                                minWidth: 60,
                                width: 60,
                                height: 44,
                                borderRadius: 0,
                                backgroundColor: '#0c5d7d',
                                '&:hover': { backgroundColor: '#093647' },
                              }}
                            >
                              <CameraAltOutlined sx={{ fontSize: 28 }} />
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          minHeight: 44,
                          p: 0,
                          borderRadius: 1,
                          backgroundColor: '#fff',
                          '& fieldset': { border: '3px solid #d1d5db' },
                          '&:hover fieldset': { borderColor: '#9ca3af' },
                          '&.Mui-focused fieldset': { borderColor: '#0c5d7d' },
                        },
                        '& .MuiOutlinedInput-input': { py: 1, fontSize: '19px' },
                      }}
                    />
                  )}
                />
                <Typography sx={{ color: '#111827', fontSize: '16px', lineHeight: 1.25 }}>
                  Scannez le QR code ou recherchez par nom / numéro de série
                </Typography>
              </Stack>

              <Stack spacing={0.75}>
                <Typography
                  component="label"
                  htmlFor="failure-description"
                  sx={{ color: '#4b5563', fontSize: '26px', fontWeight: 600 }}
                >
                  Description de la panne{' '}
                  <Box component="span" sx={{ color: '#dc5e60' }}>*</Box>
                </Typography>
                <TextField
                  id="failure-description"
                  multiline
                  minRows={6}
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value)
                    if (erreursChamps.description) {
                      setErreursChamps((current) => ({ ...current, description: '' }))
                    }
                  }}
                  error={Boolean(erreursChamps.description)}
                  helperText={erreursChamps.description}
                  placeholder="Décrivez le problème rencontré..."
                  inputProps={{ 'aria-label': 'Description de la panne' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      alignItems: 'flex-start',
                      borderRadius: 1,
                      backgroundColor: '#fafafa',
                      '& fieldset': { border: '3px solid #d1d5db' },
                      '&:hover fieldset': { borderColor: '#9ca3af' },
                      '&.Mui-focused fieldset': { borderColor: '#0c5d7d' },
                    },
                    '& .MuiInputBase-input': { p: 1.25, fontSize: '16px' },
                  }}
                />
              </Stack>

              <Stack spacing={0.75}>
                <Typography component="label" sx={{ color: '#4b5563', fontSize: '25px', fontWeight: 600 }}>
                  Photo ou vidéo de la panne
                </Typography>
                <Paper
                  variant="outlined"
                  onDragOver={(event) => { event.preventDefault(); setGlisseActif(true) }}
                  onDragLeave={() => setGlisseActif(false)}
                  onDrop={handleDrop}
                  sx={{
                    minHeight: 114,
                    px: 2.5,
                    py: 2.5,
                    border: '5px dashed #7dd180',
                    borderRadius: 1,
                    backgroundColor: glisseActif ? '#eefaf0' : '#f9fff9',
                    boxShadow: 'none',
                    transition: 'background-color 0.2s ease',
                    '&:hover': { backgroundColor: '#bcf7c5da' }
                  }}
                >
                  <Stack alignItems="center" spacing={1.25}>
                    <Box
                      sx={{
                        display: 'grid',
                        placeItems: 'center',
                        width: 44,
                        height: 44,
                        borderRadius: '20%',
                        backgroundColor: '#e8f5e9',
                        color: '#1b7548',
                      }}
                    >
                      <UploadOutlined sx={{ fontSize: 29 }} />
                    </Box>
                    <Stack alignItems="center" spacing={0.5}>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.75} flexWrap="wrap">
                        <Typography sx={{ color: '#4b5563', fontSize: '18px' }}>
                          {selectedFile ? selectedFile.name : 'Glissez une photo de la panne ici, ou'}
                        </Typography>
                        <Button
                          component="label"
                          variant="contained"
                          size="small"
                          disableElevation
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: '#1b7548',
                            fontSize: '13px',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#146f42' },
                          }}
                        >
                          Parcourir
                          <input hidden type="file" accept=".png,.jpg,.jpeg" onChange={handleFileChange} />
                        </Button>
                      </Stack>
                      <Typography sx={{ color: '#9ca3af', fontSize: '16px' }}>
                        PNG, JPG, JPEG, MP4 jusqu&apos;à 10 Mo
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
                {erreurFichier && <Alert severity="error" sx={{ mt: 1 }}>{erreurFichier}</Alert>}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={3.3}>
            <Paper
              component="aside"
              aria-label="Informations de la panne"
              variant="outlined"
              sx={{
                overflow: 'hidden',
                border: '2px solid #146f42',
                borderRadius: 1,
                backgroundColor: '#f8fafc',
                boxShadow: 'none',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ px: 2, py: 1.5, backgroundColor: '#0c5d7d', color: '#fff' }}
              >
                <ErrorOutline sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: '18px', fontWeight: 700 }}>Panne</Typography>
              </Stack>
              <Stack divider={<Box sx={{ borderBottom: '1px solid #d1d5db' }} />}>
                <Stack spacing={0.75} sx={{ p: 2 }}>
                  <Typography sx={{ color: '#6b7280', fontSize: '16px', fontWeight: 600 }}>
                    DATE DE SIGNALEMENT
                  </Typography>
                  <TextField
                    value={dateDuJour}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayOutlined sx={{ color: '#64748b', fontSize: 19 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: 34,
                        borderRadius: 1,
                        backgroundColor: '#f1f5f9',
                        '& fieldset': { borderColor: '#e2e8f0' },
                      },
                      '& .MuiInputBase-input': { p: 0, color: '#64748b', fontSize: '16px', fontWeight: 500 },
                    }}
                  />
                </Stack>
                <Stack spacing={0.75} sx={{ p: 2 }}>
                  <Typography sx={{ color: '#6b7280', fontSize: '16px', fontWeight: 600 }}>
                    PRIORITÉ
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={priority}
                      onChange={(event) => setPriority(event.target.value)}
                      IconComponent={ExpandMore}
                      sx={{
                        height: 34,
                        borderRadius: 1,
                        backgroundColor: '#fff',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#374151',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                        '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1, py: 0.5 },
                      }}
                      renderValue={(value) => (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COULEURS_PRIORITE[value] }} />
                          <Box component="span">{PRIORITE_PANNE_LABELS[value]}</Box>
                        </Stack>
                      )}
                    >
                      {Object.values(PRIORITE_PANNE).map((valeur) => (
                        <MenuItem key={valeur} value={valeur}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COULEURS_PRIORITE[valeur] }} />
                            <Box component="span">{PRIORITE_PANNE_LABELS[valeur]}</Box>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Stack spacing={0.75} sx={{ p: 2 }}>
                  <Typography sx={{ color: '#6b7280', fontSize: '17px', fontWeight: 600 }}>
                    STATUT
                  </Typography>
                  <Box>
                    <Chip
                      label="Signalée"
                      size="small"
                      sx={{
                        height: 28,
                        px: 0.5,
                        borderRadius: 2,
                        backgroundColor: '#e0f2fe',
                        color: '#0c5d7d',
                        fontSize: '16px',
                        fontWeight: 600,
                        '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 0.75 },
                        '& .MuiChip-label::before': {
                          content: '""',
                          display: 'inline-block',
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: '#0c5d7d',
                        },
                      }}
                    />
                  </Box>
                </Stack>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ color: '#1f2937', fontSize: '16px', lineHeight: 1.2 }}>
                    Le statut sera automatiquement mis à jour par le technicien assigné.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ pt: 0.5 }}>
          <Button
            type="button"
            variant="contained"
            disableElevation
            onClick={() => navigate(-1)}
            disabled={envoi}
            sx={{
              px: 2.25,
              py: 1,
              borderRadius: 1,
              backgroundColor: '#dc5e60',
              border: '4px solid #dc5e60',
              fontSize: '16px',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#c84e50', transform: 'scale(1.02)' },
            }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disableElevation
            onClick={handleSubmit}
            disabled={envoi}
            startIcon={!envoi && <InfoOutlined sx={{ fontSize: 17 }} />}
            sx={{
              px: 2.25,
              py: 1,
              borderRadius: 1,
              backgroundColor: '#146f42',
              fontSize: '15px',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#0f5935', transform: 'scale(1.02)' },
            }}
          >
            {envoi ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Signaler la panne'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}