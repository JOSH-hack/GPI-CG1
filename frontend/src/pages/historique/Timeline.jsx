/*

Nom du fichier   : Timeline.jsx
Objectif         : Page Suivi d'un equipement - recherche, fiche recap, indicateurs (nombre de pannes, temps moyen de resolution, anciennete), timeline chronologique fusionnee Panne + Intervention + HistoriqueMouvement
Propriétaire     : Josué BEDEL
Date de création : 04/09/2026

*/

import { useEffect, useMemo, useState } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'

import { equipementApi } from '../../api/equipementApi'
import { panneApi } from '../../api/panneApi'
import { interventionApi } from '../../api/interventionApi'
import { historiqueApi } from '../../api/historiqueApi'
import backgroundPic from '../../assets/background/backgroundpic.png'
import StatusChip from '../../components/common/StatusChip'
import { TYPE_MOUVEMENT_LABELS } from '../../utils/constants'

const COULEURS_EVENEMENT = {
  Panne: '#e53e3e',
  Intervention: '#ed8936',
  Affectation: '#4299e1',
  Déplacement: '#9f7aea',
  'Changement de statut': '#48bb78',
}

function libelleLocalisation(loc) {
  if (!loc) return '—'
  return [loc.annexe, loc.service, loc.bureau].filter(Boolean).join(' - ')
}

function formaterDate(dateIso) {
  if (!dateIso) return '—'
  return new Date(dateIso).toLocaleDateString('fr-FR')
}

function calculerAnciennete(dateAcquisition) {
  if (!dateAcquisition) return '—'
  const debut = new Date(dateAcquisition)
  const maintenant = new Date()
  let mois = (maintenant.getFullYear() - debut.getFullYear()) * 12 + (maintenant.getMonth() - debut.getMonth())
  const ans = Math.floor(mois / 12)
  const moisRestants = mois % 12
  const partAns = ans > 0 ? `${ans} an${ans > 1 ? 's' : ''}` : ''
  const partMois = moisRestants > 0 ? `${moisRestants} mois` : ''
  return [partAns, partMois].filter(Boolean).join(' et ') || 'Moins d\'un mois'
}

export default function Timeline() {
  const [equipements, setEquipements] = useState([])
  const [equipementChoisi, setEquipementChoisi] = useState(null)
  const [inputRecherche, setInputRecherche] = useState('')

  const [chargementDetail, setChargementDetail] = useState(false)
  const [evenements, setEvenements] = useState([])
  const [nombrePannes, setNombrePannes] = useState(0)
  const [tempsMoyenResolution, setTempsMoyenResolution] = useState(null)

  const [filtresActifs, setFiltresActifs] = useState(Object.keys(COULEURS_EVENEMENT))

  useEffect(() => {
    equipementApi.listerTous().then((res) => setEquipements(res.data)).catch(() => setEquipements([]))
  }, [])

  useEffect(() => {
    if (!equipementChoisi) return
    chargerDetailEquipement(equipementChoisi.idEquipement)
  }, [equipementChoisi])

  async function chargerDetailEquipement(idEquipement) {
    setChargementDetail(true)
    try {
      const [resPannes, resMouvements] = await Promise.all([
        panneApi.listerParEquipement(idEquipement),
        historiqueApi.timelineParEquipement(idEquipement),
      ])

      const pannes = resPannes.data
      setNombrePannes(pannes.length)

      // Recupere les interventions de chaque panne pour construire les evenements
      // Intervention + calculer le temps moyen de resolution
      const listesInterventions = await Promise.all(
        pannes.map((panne) => interventionApi.listerParPanne(panne.idPanne).then((r) => r.data).catch(() => []))
      )
      const interventions = listesInterventions.flat()

      const dureesResolues = interventions
        .filter((i) => i.dateResolution)
        .map((i) => (new Date(i.dateResolution) - new Date(i.dateIntervention)) / (1000 * 60 * 60 * 24))
      const moyenne = dureesResolues.length
        ? dureesResolues.reduce((a, b) => a + b, 0) / dureesResolues.length
        : null
      setTempsMoyenResolution(moyenne)

      // Construction de la timeline fusionnee
      const evenementsPannes = pannes.map((p) => ({
        date: p.dateSurvenance,
        type: 'Panne',
        titre: 'Panne signalée',
        description: p.description,
      }))

      const evenementsInterventions = interventions.flatMap((i) => {
        const items = [
          {
            date: i.dateIntervention,
            type: 'Intervention',
            titre: 'Intervention en cours',
            description: `Technicien ${i.technicien?.nom || ''} ${i.technicien?.prenom || ''} assigné au dépannage`.trim(),
          },
        ]
        if (i.dateResolution) {
          items.push({
            date: i.dateResolution,
            type: 'Changement de statut',
            titre: i.resultat === 'REPARATION' ? 'Réparation terminée' : 'Dépannage terminé',
            description: i.solution || '',
          })
        }
        return items
      })

      const evenementsMouvements = resMouvements.data.map((m) => ({
        date: m.dateMouvement,
        type:
          m.typeMouvement === 'DEPLACEMENT'
            ? 'Déplacement'
            : m.typeMouvement === 'AFFECTATION'
              ? 'Affectation'
              : 'Changement de statut',
        titre: TYPE_MOUVEMENT_LABELS[m.typeMouvement] || m.typeMouvement,
        description: `${m.ancienneValeur || '—'} → ${m.nouvelleValeur || '—'}${m.motif ? ' - ' + m.motif : ''}`,
      }))

      const tousLesEvenements = [...evenementsPannes, ...evenementsInterventions, ...evenementsMouvements].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )

      setEvenements(tousLesEvenements)
    } catch {
      setEvenements([])
    } finally {
      setChargementDetail(false)
    }
  }

  function toggleFiltre(type) {
    setFiltresActifs((precedent) =>
      precedent.includes(type) ? precedent.filter((t) => t !== type) : [...precedent, type]
    )
  }

  const evenementsVisibles = useMemo(
    () => evenements.filter((e) => filtresActifs.includes(e.type)),
    [evenements, filtresActifs]
  )

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
          backgroundImage: `url(${backgroundPic})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography sx={{ color: '#0c5d7d', fontSize: '20px', fontWeight: 700, mb: 2 }}>
          Suivi d&apos;un équipement
        </Typography>

        <Autocomplete
          options={equipements}
          inputValue={inputRecherche}
          onInputChange={(_, value) => setInputRecherche(value)}
          onChange={(_, value) => setEquipementChoisi(value)}
          getOptionLabel={(option) => `${option.codeInventaire} - ${option.nom}`}
          filterOptions={(options, state) => {
            const q = state.inputValue.toLowerCase()
            return options.filter(
              (o) =>
                o.codeInventaire.toLowerCase().includes(q) ||
                o.nom.toLowerCase().includes(q) ||
                (o.numeroSerie || '').toLowerCase().includes(q)
            )
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Rechercher un équipement (code inventaire, nom, n° série)..."
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mb: 2, bgcolor: '#f7fafc', '& fieldset': { borderColor: '#1b7548', borderWidth: 2 } }}
            />
          )}
        />

        {!equipementChoisi && (
          <Typography sx={{ color: 'text.secondary', fontSize: 14, textAlign: 'center', mt: 4 }}>
            Recherchez un équipement pour afficher son suivi.
          </Typography>
        )}

        {equipementChoisi && (
          <>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, border: '3px solid #146f42', borderRadius: '10px' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  columnGap: 4,
                  rowGap: 1.5,
                }}
              >
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }}>
                    Code inventaire
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{equipementChoisi.codeInventaire}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }}>Nom</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{equipementChoisi.nom}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }}>Catégorie</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    {equipementChoisi.categorie?.libelle || '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }}>Statut</Typography>
                  <StatusChip type="statutEquipement" value={equipementChoisi.statut} />
                </Box>
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }}>
                    Localisation
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    {libelleLocalisation(equipementChoisi.localisation)}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }}>
                    Agent affecté
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    {equipementChoisi.agent ? `${equipementChoisi.agent.nom} ${equipementChoisi.agent.prenom}` : 'Non affecté'}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, mb: 2 }}>
              {[
                { label: 'Nombre total de pannes', valeur: nombrePannes, couleur: '#e53e3e', Icone: WarningAmberOutlinedIcon },
                {
                  label: 'Temps moyen de résolution',
                  valeur: tempsMoyenResolution !== null ? `${tempsMoyenResolution.toFixed(1)} jours` : '—',
                  couleur: '#4299e1',
                  Icone: AccessTimeOutlinedIcon,
                },
                {
                  label: 'Ancienneté',
                  valeur: calculerAnciennete(equipementChoisi.dateAcquisition),
                  couleur: '#0c5d7d',
                  Icone: CalendarTodayOutlinedIcon,
                },
              ].map((stat) => (
                <Paper key={stat.label} variant="outlined" sx={{ p: 1.5, border: '3px solid #146f42', borderRadius: '10px' }}>
                  <Stack spacing={0.75}>
                    <Box
                      sx={{
                        display: 'grid',
                        placeItems: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        bgcolor: stat.couleur,
                      }}
                    >
                      <stat.Icone sx={{ color: '#fff', fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>{stat.label}</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{stat.valeur}</Typography>
                  </Stack>
                </Paper>
              ))}
            </Box>

            <Paper
              variant="outlined"
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1, mb: 2, bgcolor: '#f7fafc', borderRadius: '10px' }}
            >
              {Object.entries(COULEURS_EVENEMENT).map(([type, couleur]) => (
                <Chip
                  key={type}
                  label={type}
                  size="small"
                  onClick={() => toggleFiltre(type)}
                  icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: couleur }} />}
                  sx={{
                    bgcolor: '#fff',
                    border: '1px solid #e2e8f0',
                    opacity: filtresActifs.includes(type) ? 1 : 0.4,
                  }}
                />
              ))}
            </Paper>

            {chargementDetail ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Stack component="ol" spacing={0} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {evenementsVisibles.length === 0 && (
                  <Typography sx={{ color: 'text.secondary', fontSize: 14, textAlign: 'center', py: 3 }}>
                    Aucun événement pour cet équipement.
                  </Typography>
                )}
                {evenementsVisibles.map((evenement, index) => (
                  <Stack key={`${evenement.date}-${index}`} direction="row" spacing={1.5}>
                    <Stack alignItems="center" sx={{ width: 16, flexShrink: 0 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          mt: 0.5,
                          borderRadius: '50%',
                          bgcolor: COULEURS_EVENEMENT[evenement.type],
                        }}
                      />
                      {index < evenementsVisibles.length - 1 && (
                        <Box sx={{ width: 1, minHeight: 30, flex: 1, bgcolor: '#e2e8f0' }} />
                      )}
                    </Stack>
                    <Stack spacing={0.25} sx={{ pb: index < evenementsVisibles.length - 1 ? 1.5 : 0 }}>
                      <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }}>
                        {formaterDate(evenement.date)}
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{evenement.titre}</Typography>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{evenement.description}</Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<DownloadOutlinedIcon />}
                onClick={() => window.print()}
                sx={{ bgcolor: '#1b7548', textTransform: 'none', '&:hover': { bgcolor: '#155d39' } }}
              >
                Télécharger
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Box>
  )
}