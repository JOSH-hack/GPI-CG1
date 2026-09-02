/*

Nom du fichier   : DashboardLayout.jsx
Objectif         : Layout partage de toutes les pages authentifiees - Sidebar +
                    Navbar fixes, contenu de la page rendu via Outlet
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026
Date de mise à jour : 02/09/2026
Objet de mise à jour : Layout reel (etait un stub) - Sidebar/Navbar extraits
                       et mutualises depuis Liste.jsx / Dashboard.jsx

*/

import { Box, Stack } from '@mui/material'
import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function DashboardLayout() {
  return (
    <Box
      component="main"
      sx={{ display: 'flex', minHeight: '100vh', width: '100%', overflow: 'hidden', bgcolor: 'background.default' }}
    >
      <Box component="aside" sx={{ flexShrink: 0 }}>
        <Sidebar />
      </Box>
      <Stack component="section" sx={{ flex: 1, minWidth: 0 }}>
        <Navbar />
        <Outlet />
      </Stack>
    </Box>
  )
}