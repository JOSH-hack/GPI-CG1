/*

Nom du fichier   : Sidebar.jsx
Objectif         : Barre de navigation laterale - menu dynamique selon le role
                    de l'utilisateur connecte (MENU_PAR_ROLE), item selectionne/
                    deplie determine automatiquement depuis l'URL courante
Propriétaire     : Josué BEDEL
Date de création : 02/09/2026

*/

import { useMemo, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import { useAuth } from '../../contexts/AuthContext'
import { MENU_PAR_ROLE } from '../../config/menuConfig'
import iconMenu from '../../assets/icons/icon-menu.svg'
import iconChevron from '../../assets/icons/chevron.svg'
import logoMairie from '../../assets/icons/logo.svg'

function IconImg({ src, size = 18, sx, ...props }) {
  return (
    <Box
      component="img"
      src={src}
      alt=""
      aria-hidden="true"
      sx={{ width: size, height: size, ...sx }}
      {...props}
    />
  )
}

export default function Sidebar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = useMemo(() => MENU_PAR_ROLE[user?.role] || [], [user?.role])

  // Determine automatiquement le groupe a deplier et l'item selectionne
  // en fonction de l'URL courante - plus besoin de le coder en dur par page.
  const groupeActif = useMemo(() => {
    return navigationItems.find((item) =>
      item.children?.some((child) => child.path === location.pathname)
    )?.label
  }, [navigationItems, location.pathname])

  const [expandedItem, setExpandedItem] = useState(groupeActif || '')

  useEffect(() => {
    if (groupeActif) setExpandedItem(groupeActif)
  }, [groupeActif])

  function handleGroupClick(item) {
    if (item.children) {
      setExpandedItem((current) => (current === item.label ? '' : item.label))
    } else if (item.path) {
      navigate(item.path)
    }
  }

  return (
    <Paper
      component="aside"
      square
      elevation={0}
      sx={{
        width: 248,
        minWidth: 248,
        minHeight: '100vh',
        bgcolor: '#1d7b4e',
        color: 'common.white',
        overflow: 'hidden',
      }}
    >
      <Stack component="nav" aria-label="Navigation principale" spacing={0}>
        <Box component="header" sx={{ px: 1.75, pt: 1.25, pb: 3.5 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box
              component="img"
              src={logoMairie}
              alt="Logo de la Mairie du Golfe 1"
              sx={{ width: 48, height: 43, flexShrink: 0, objectFit: 'contain' }}
            />
            <Typography
              component="h1"
              noWrap
              sx={{
                color: '#fef7ff',
                fontFamily: 'Quicksand, sans-serif',
                fontWeight: 600,
                fontSize: 31,
                lineHeight: 1,
                letterSpacing: 0.7,
              }}
            >
              GPI - CG1
            </Typography>
          </Stack>
        </Box>

        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton sx={{ minHeight: 34, px: 1.5, color: 'common.white' }}>
              <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                <IconImg src={iconMenu} size={20} />
              </ListItemIcon>
              <ListItemText
                primary="MENU"
                primaryTypographyProps={{ fontSize: 15, fontWeight: 700, letterSpacing: 1.1 }}
              />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ mx: 1.5, borderColor: 'rgba(255,255,255,0.12)' }} />

          {navigationItems.map((item) => {
            const isExpanded = expandedItem === item.label
            const isGroupeActif = groupeActif === item.label

            return (
              <Box key={item.label}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleGroupClick(item)}
                    selected={isGroupeActif}
                    sx={{
                      minHeight: 33,
                      px: 1.5,
                      color: 'common.white',
                      '&.Mui-selected': { bgcolor: 'rgba(12, 93, 125, 0.72)' },
                      '&.Mui-selected:hover': { bgcolor: 'rgba(12, 93, 125, 0.72)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                      <IconImg src={item.icon} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 15, fontWeight: 700 }}
                    />
                    {item.children && (
                      <IconImg
                        src={iconChevron}
                        size={19}
                        sx={{
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>

                {item.children && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List disablePadding>
                      {item.children.map((child) => {
                        const isSelected = location.pathname === child.path
                        return (
                          <ListItem key={child.label} disablePadding>
                            <ListItemButton
                              onClick={() => navigate(child.path)}
                              selected={isSelected}
                              sx={{
                                minHeight: 33,
                                pl: 5,
                                pr: 1.5,
                                color: 'rgba(255,255,255,0.88)',
                                '&.Mui-selected': {
                                  color: '#ff8a91',
                                  bgcolor: 'rgba(12, 93, 125, 0.72)',
                                },
                                '&.Mui-selected:hover': {
                                  bgcolor: 'rgba(12, 93, 125, 0.72)',
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 24, color: 'inherit' }}>
                                <IconImg src={child.icon} size={16} />
                              </ListItemIcon>
                              <ListItemText
                                primary={child.label}
                                primaryTypographyProps={{
                                  fontSize: 14,
                                  fontWeight: isSelected ? 700 : 400,
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        )
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            )
          })}
        </List>
      </Stack>
    </Paper>
  )
}