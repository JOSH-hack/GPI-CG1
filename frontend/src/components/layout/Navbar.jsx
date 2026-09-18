/*

Nom du fichier   : Navbar.jsx
Objectif         : Bandeau superieur - fil d'Ariane derive automatiquement de
                    menuConfig.js selon l'URL courante, bouton profil + deconnexion,
                    cloche de notifications agregeant les badges du menu
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026

*/

import { useMemo, useState } from 'react'
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom'
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined'
import {
  AppBar,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  GlobalStyles,
  IconButton,
  Link,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Stack,
  Typography,
} from '@mui/material'

import { useAuth } from '../../contexts/AuthContext'
import { MENU_PAR_ROLE, iconProfil } from '../../config/menuConfig'
import iconAccueil from '../../assets/icons/icon-accueil.svg'

function IconImg({ src, size = 16 }) {
  return (
    <Box
      component="img"
      src={src}
      alt=""
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        filter: 'brightness(0) invert(1)',
      }}
    />
  )
}

export default function Navbar({ badges = {} }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [ancrageNotifications, setAncrageNotifications] = useState(null)

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

  const itemsAvecNouveaute = useMemo(() => {
    const navigationItems = MENU_PAR_ROLE[user?.role] || []
    const items = []
    navigationItems.forEach((groupe) => {
      groupe.children?.forEach((enfant) => {
        if (badges[enfant.path]) items.push(enfant)
      })
    })
    return items
  }, [user?.role, badges])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function handleOuvrirNotifications(event) {
    setAncrageNotifications(event.currentTarget)
  }

  function handleFermerNotifications() {
    setAncrageNotifications(null)
  }

  function handleAllerVers(path) {
    handleFermerNotifications()
    navigate(path)
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

        <GlobalStyles
          styles={{
            '@keyframes gpiBellBadgePulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(255,77,79,0.7)' },
              '70%': { boxShadow: '0 0 0 6px rgba(184, 16, 18, 0.93)' },
              '100%': { boxShadow: '0 0 0 0 rgba(204, 41, 44, 0)' },
            },
          }}
        />

        <IconButton
          onClick={handleOuvrirNotifications}
          aria-label={
            itemsAvecNouveaute.length > 0
              ? `${itemsAvecNouveaute.length} nouvelle(s) notification(s)`
              : 'Aucune nouvelle notification'
          }
          sx={{ color: '#fef7ff' }}
        >
          <Badge
            variant="dot"
            invisible={itemsAvecNouveaute.length === 0}
            sx={{
              '& .MuiBadge-dot': {
                bgcolor: '#ff4d4f',
                animation: 'gpiBellBadgePulse 1.4s ease-in-out infinite',
              },
            }}
          >
            <NotificationsNoneOutlined />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={ancrageNotifications}
          open={Boolean(ancrageNotifications)}
          onClose={handleFermerNotifications}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {itemsAvecNouveaute.length === 0 ? (
            <Box sx={{ px: 2, py: 1.5, maxWidth: 260 }}>
              <Typography sx={{ fontFamily: 'Quicksand, sans-serif', fontSize: '0.85rem', color: 'text.secondary' }}>
                Rien de nouveau pour le moment.
              </Typography>
            </Box>
          ) : (
            itemsAvecNouveaute.map((item) => (
              <ListItemButton key={item.path} onClick={() => handleAllerVers(item.path)} sx={{ minWidth: 220 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Box
                    component="span"
                    sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff4d4f', display: 'inline-block' }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontFamily: 'Quicksand, sans-serif', fontSize: '0.85rem', fontWeight: 600 }}
                />
              </ListItemButton>
            ))
          )}
        </Menu>

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