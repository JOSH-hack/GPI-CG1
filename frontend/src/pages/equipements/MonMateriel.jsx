/*

Nom du fichier   : MonMateriel.jsx
Objectif         : Page dediee "Mon materiel" pour l'agent - liste complete
                    de son materiel attribue (le Dashboard n'en montre qu'un
                    apercu)
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import { equipementApi } from '../../api/equipementApi'
import { STATUT_EQUIPEMENT } from '../../utils/constants'

function formaterDate(valeur) {
  if (!valeur) return '—'
  return new Date(valeur).toLocaleDateString('fr-FR')
}

function etatEquipement(statut) {
  if (statut === STATUT_EQUIPEMENT.EN_PANNE) return { label: 'En panne', color: '#dc5e60' }
  if (statut === STATUT_EQUIPEMENT.EN_SERVICE) return { label: 'Fonctionnel', color: '#1b7548' }
  if (statut === STATUT_EQUIPEMENT.EN_STOCK) return { label: 'En stock', color: '#0c5d7d' }
  return { label: 'Mis au rebut', color: '#9CA3AF' }
}

export default function MonMateriel() {
  const [equipements, setEquipements] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    equipementApi
      .monMateriel()
      .then((res) => setEquipements(res.data))
      .catch(() => setErreur('Impossible de charger votre matériel.'))
      .finally(() => setChargement(false))
  }, [])

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, width: '100%', boxSizing: 'border-box', fontFamily: 'Quicksand, sans-serif' }}>
      <Typography sx={{ color: '#0c5d7d', fontSize: 24, fontWeight: 700, mb: 2 }}>Mon Matériel</Typography>

      {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}

      <TableContainer sx={{ border: '2px solid #146f42', borderRadius: '9px', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#0c5d7d' }}>
              {['Équipement', 'Marque / Modèle', 'N° Série', 'État', "Date d'attribution"].map((label) => (
                <TableCell key={label} sx={{ color: '#fff', fontWeight: 700 }}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {chargement ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : equipements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  Aucun matériel ne vous est attribué.
                </TableCell>
              </TableRow>
            ) : (
              equipements.map((equipement, index) => {
                const etat = etatEquipement(equipement.statut)
                return (
                  <TableRow key={equipement.idEquipement} sx={{ bgcolor: index % 2 === 0 ? '#fff' : '#f3f4f6' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#0c5d7d' }}>{equipement.nom}</TableCell>
                    <TableCell sx={{ color: '#0c5d7d' }}>{[equipement.marque, equipement.modele].filter(Boolean).join(' ')}</TableCell>
                    <TableCell sx={{ color: '#0c5d7d' }}>{equipement.numeroSerie || '—'}</TableCell>
                    <TableCell>
                      <Chip label={etat.label} size="small" sx={{ bgcolor: etat.color, color: '#fff', fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ color: '#0c5d7d' }}>{formaterDate(equipement.dateAcquisition)}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}