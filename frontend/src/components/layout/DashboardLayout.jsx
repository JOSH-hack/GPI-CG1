/*

Nom du fichier   : DashboardLayout.jsx
Objectif         : Layout partage de toutes les pages authentifiees - Sidebar +
                    Navbar fixes, contenu de la page rendu via Outlet
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026
Date de mise à jour : 18/09/2026
Objet de mise à jour : Sidebar veritablement fixe - conteneur racine a hauteur
                       figee (100vh) + scroll reserve a la zone de contenu,
                       plus fiable qu'un position sticky qui depend du contexte
                       de defilement des ancetres

*/

import { Box, Stack } from '@mui/material'
import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useMenuBadges } from '../../hooks/useMenuBadges'

export default function DashboardLayout() {
  const badges = useMenuBadges()

  return (
    <Box
      component="main"
      sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', bgcolor: 'background.default' }}
    >
      <Box component="aside" sx={{ flexShrink: 0, height: '100%' }}>
        <Sidebar badges={badges} />
      </Box>

      <Stack component="section" sx={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto' }}>
        <Navbar badges={badges} />
        <Outlet />
      </Stack>
    </Box>
  )
}