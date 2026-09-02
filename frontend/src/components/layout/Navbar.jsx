/*

Nom du fichier   : Navbar.jsx
Objectif         : Bandeau superieur - fil d'Ariane derive automatiquement de
                    menuConfig.js selon l'URL courante, bouton profil + deconnexion
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026

*/

import { useMemo } from 'react'
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom'
import { AppBar, Box, Breadcrumbs, Button, Link, Stack, Typography } from '@mui/material'

import { useAuth } from '../../contexts/AuthContext'
import { MENU_PAR_ROLE, iconProfil } from '../../config/menuConfig'
import iconAccueil from '../../assets/icons/icon-accueil.svg'

function IconImg({ src, size = 16 }) {
  return (
    <Box component="img" src={src} alt="" aria-hidden="true" sx={{ width: size, height: size }} />
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const fil = useMemo(() => {
    const navigationItems = MENU_PAR_ROLE[user?.role] || []
    for (const item of navigationItems) {
      const enfantActif = item.children?.find((child) => child.path === location.pathname)
      if (enfantActif) {
        return [
          { label: item.label, icon: item.icon },
          { label: enfantActif.label, icon: enfantActif.icon },
        ]
      }
    }
    return []
  }, [user?.role, location.pathname])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <AppBar
      component="header"
      position="relative"
      elevation={0}
      sx={{ bgcolor: '#0c5d7d', boxShadow: '0px 4px 6.7px 2px rgba(12, 93, 125, 0.65)' }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{ minHeight: { xs: 64, sm: 80 }, px: { xs: 2, sm: 3 }, gap: { xs: 2, md: 4 } }}
      >
        <Box component="nav" aria-label="Fil d'Ariane" sx={{ flexGrow: 1 }}>
          <Breadcrumbs
            separator="/"
            aria-label="Fil d'Ariane"
            sx={{
              color: '#fef7ff',
              '& .MuiBreadcrumbs-separator': { color: '#fef7ff', mx: { xs: 0.5, sm: 1 } },
            }}
          >
            <Link
              component={RouterLink}
              to="/dashboard"
              underline="none"
              color="inherit"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontFamily: 'Quicksand, sans-serif',
                fontSize: { xs: '0.7rem', sm: '0.9rem' },
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              <IconImg src={iconAccueil} />
              ACCUEIL
            </Link>
            {fil.map((etape, index) => (
              <Stack
                key={etape.label}
                direction="row"
                alignItems="center"
                spacing={0.5}
                aria-current={index === fil.length - 1 ? 'page' : undefined}
              >
                <IconImg src={etape.icon} />
                <Typography
                  component="span"
                  sx={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: { xs: '0.7rem', sm: '0.9rem' },
                    fontWeight: 600,
                  }}
                >
                  {etape.label}
                </Typography>
              </Stack>
            ))}
          </Breadcrumbs>
        </Box>

        <Button
          type="button"
          onClick={handleLogout}
          variant="contained"
          startIcon={<IconImg src={iconProfil} size={18} />}
          aria-label={`Profil connecté : ${user?.nom || ''} - Se déconnecter`}
          sx={{
            minWidth: { xs: 0, sm: 153 },
            px: { xs: 1, sm: 1.5 },
            py: 0.75,
            borderRadius: '7px',
            bgcolor: '#dc5e60',
            boxShadow: 'none',
            textTransform: 'none',
            '&:hover': { bgcolor: '#c95355', boxShadow: 'none' },
          }}
        >
          <Stack alignItems="flex-start" spacing={0}>
            <Typography
              component="span"
              sx={{ color: '#fff', fontFamily: 'Quicksand, sans-serif', fontSize: '0.72rem', fontWeight: 500, lineHeight: 1.1 }}
            >
              Profil connecté :
            </Typography>
            <Typography
              component="span"
              sx={{ color: '#fff', fontFamily: 'Quicksand, sans-serif', fontSize: '0.72rem', fontWeight: 500, lineHeight: 1.1 }}
            >
              {user?.nom || '...'}
            </Typography>
          </Stack>
        </Button>
      </Stack>
    </AppBar>
  )
}