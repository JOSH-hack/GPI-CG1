/*

Nom du fichier   : FormReseau.jsx
Objectif         : Formulaire de creation d'un equipement de type RESEAU
                    (switch, routeur, borne wifi...) - champs communs
                    (EquipementRequest) + champs specifiques reseau
Propriétaire     : Josué BEDEL
Date de création : 01/09/2026

*/

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { equipementApi } from '../../api/equipementApi'
import { categorieApi } from '../../api/categorieApi'
import { localisationApi } from '../../api/localisationApi'

const STATUTS = [
  { value: 'EN_STOCK', label: 'En stock' },
  { value: 'EN_SERVICE', label: 'En service' },
  { value: 'EN_PANNE', label: 'En panne' },
]

const TYPES_ADRESSE = [
  { value: 'STATIQUE', label: 'Statique' },
  { value: 'DYNAMIQUE', label: 'Dynamique' },
]

const VALEURS_INITIALES = {
  nom: '',
  codeInventaire: '',
  numeroSerie: '',
  tagQr: '',
  marque: '',
  modele: '',
  description: '',
  dateAcquisition: '',
  finGarantie: '',
  coutAcquisition: '',
  statut: 'EN_STOCK',
  idCategorie: '',
  idLocalisation: '',
  typeAdresse: 'DYNAMIQUE',
  adresseIp: '',
  masqueSousReseau: '',
  passerelle: '',
  dns: '',
  nomHote: '',
  nombrePorts: '',
}

function libelleLocalisation(loc) {
  return [loc.annexe, loc.service, loc.bureau, loc.poste].filter(Boolean).join(' - ')
}

export default function FormReseau() {
  const navigate = useNavigate()
  const [valeurs, setValeurs] = useState(VALEURS_INITIALES)
  const [categories, setCategories] = useState([])
  const [localisations, setLocalisations] = useState([])
  const [chargementListes, setChargementListes] = useState(true)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    let annule = false

    async function chargerListes() {
      try {
        const [resCategories, resLocalisations] = await Promise.all([
          categorieApi.listerParType('RESEAU'),
          localisationApi.listerToutes(),
        ])
        if (!annule) {
          setCategories(resCategories.data)
          setLocalisations(resLocalisations.data)
        }
      } catch {
        if (!annule) {
          setErreur('Impossible de charger les catégories ou les localisations')
        }
      } finally {
        if (!annule) setChargementListes(false)
      }
    }

    chargerListes()
    return () => {
      annule = true
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setValeurs((v) => ({ ...v, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErreur('')
    setLoading(true)

    try {
      const payload = {
        ...valeurs,
        finGarantie: valeurs.finGarantie || null,
        coutAcquisition: valeurs.coutAcquisition ? Number(valeurs.coutAcquisition) : null,
        idCategorie: Number(valeurs.idCategorie),
        idLocalisation: Number(valeurs.idLocalisation),
        nombrePorts: valeurs.nombrePorts ? Number(valeurs.nombrePorts) : null,
      }
      await equipementApi.creerReseau(payload)
      navigate('/parc/equipements')
    } catch (err) {
      setErreur(
        err.response?.data?.message ||
        "Erreur lors de la création de l'équipement réseau"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1b7548' }}>
            Nouvel équipement réseau
          </Typography>

          {erreur && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {erreur}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
              Informations générales
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
                mb: 3,
              }}
            >
              <TextField
                required
                name="nom"
                label="Nom de l'équipement"
                value={valeurs.nom}
                onChange={handleChange}
              />
              <TextField
                required
                name="codeInventaire"
                label="Code inventaire"
                value={valeurs.codeInventaire}
                onChange={handleChange}
              />
              <TextField
                name="numeroSerie"
                label="Numéro de série"
                value={valeurs.numeroSerie}
                onChange={handleChange}
              />
              <TextField
                name="tagQr"
                label="Tag QR (optionnel)"
                value={valeurs.tagQr}
                onChange={handleChange}
              />
              <TextField
                name="marque"
                label="Marque"
                value={valeurs.marque}
                onChange={handleChange}
              />
              <TextField
                name="modele"
                label="Modèle"
                value={valeurs.modele}
                onChange={handleChange}
              />
              <TextField
                required
                type="date"
                name="dateAcquisition"
                label="Date d'acquisition"
                value={valeurs.dateAcquisition}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                name="finGarantie"
                label="Fin de garantie"
                value={valeurs.finGarantie}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="number"
                name="coutAcquisition"
                label="Coût d'acquisition"
                value={valeurs.coutAcquisition}
                onChange={handleChange}
                inputProps={{ min: 0, step: '0.01' }}
              />
              <TextField
                select
                name="statut"
                label="Statut"
                value={valeurs.statut}
                onChange={handleChange}
              >
                {STATUTS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                required
                select
                name="idCategorie"
                label="Catégorie"
                value={valeurs.idCategorie}
                onChange={handleChange}
                disabled={chargementListes}
                helperText={
                  !chargementListes && categories.length === 0
                    ? 'Aucune catégorie de type réseau - créez-en une avant de continuer'
                    : ' '
                }
              >
                {categories.map((c) => (
                  <MenuItem key={c.idCategorie} value={c.idCategorie}>
                    {c.libelle}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                required
                select
                name="idLocalisation"
                label="Localisation"
                value={valeurs.idLocalisation}
                onChange={handleChange}
                disabled={chargementListes}
              >
                {localisations.map((l) => (
                  <MenuItem key={l.idLocalisation} value={l.idLocalisation}>
                    {libelleLocalisation(l)}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={2}
              name="description"
              label="Description"
              value={valeurs.description}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />

            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
              Configuration réseau
            </Typography>
            {/* masqueSousReseau et dns ne sont pas encore recopies vers l'entite
                            par EquipementMapper cote backend (a corriger la-bas) - les champs
                            restent ici car l'API les accepte sans erreur, mais leur valeur ne
                            sera pas persistee pour le moment. */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
                mb: 4,
              }}
            >
              <TextField
                select
                name="typeAdresse"
                label="Type d'adresse"
                value={valeurs.typeAdresse}
                onChange={handleChange}
              >
                {TYPES_ADRESSE.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name="adresseIp"
                label="Adresse IP"
                value={valeurs.adresseIp}
                onChange={handleChange}
              />
              <TextField
                name="masqueSousReseau"
                label="Masque de sous-réseau"
                helperText="Non enregistré pour le moment (bug backend connu)"
                value={valeurs.masqueSousReseau}
                onChange={handleChange}
              />
              <TextField
                name="passerelle"
                label="Passerelle"
                value={valeurs.passerelle}
                onChange={handleChange}
              />
              <TextField
                name="dns"
                label="DNS"
                helperText="Non enregistré pour le moment (bug backend connu)"
                value={valeurs.dns}
                onChange={handleChange}
              />
              <TextField
                name="nomHote"
                label="Nom d'hôte"
                value={valeurs.nomHote}
                onChange={handleChange}
              />
              <TextField
                type="number"
                name="nombrePorts"
                label="Nombre de ports"
                value={valeurs.nombrePorts}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/parc/equipements')}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || chargementListes}
                sx={{ bgcolor: '#1b7548', '&:hover': { bgcolor: '#145d39' } }}
              >
                {loading ? 'Création...' : "Créer l'équipement"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}