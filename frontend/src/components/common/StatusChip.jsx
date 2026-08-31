/*

Nom du fichier   : StatusChip.jsx
Objectif         : Badge colore generique pour afficher un statut,
                     une priorite ou un type de mouvement, en s'appuyant
                     sur les libelles et couleurs definis dans constants.js
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026

*/

import { Chip } from '@mui/material'
import {
  STATUT_EQUIPEMENT_LABELS,
  STATUT_EQUIPEMENT_COLORS,
  STATUT_PANNE_LABELS,
  STATUT_PANNE_COLORS,
  PRIORITE_PANNE_LABELS,
  PRIORITE_PANNE_COLORS,
  TYPE_MOUVEMENT_LABELS,
  TYPE_MOUVEMENT_COLORS,
} from '../../utils/constants'

const REGISTRES = {
  statutEquipement: { labels: STATUT_EQUIPEMENT_LABELS, colors: STATUT_EQUIPEMENT_COLORS },
  statutPanne: { labels: STATUT_PANNE_LABELS, colors: STATUT_PANNE_COLORS },
  prioritePanne: { labels: PRIORITE_PANNE_LABELS, colors: PRIORITE_PANNE_COLORS },
  typeMouvement: { labels: TYPE_MOUVEMENT_LABELS, colors: TYPE_MOUVEMENT_COLORS },
}

export default function StatusChip({ type, value, size = 'small' }) {
  const registre = REGISTRES[type]

  if (!registre) {
    return <Chip label={value} size={size} />
  }

  const label = registre.labels[value] || value
  const color = registre.colors[value] || 'default'

  return <Chip label={label} color={color} size={size} />
}