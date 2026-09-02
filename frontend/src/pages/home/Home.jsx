/*

Nom du fichier   : Home.jsx
Objectif         : Page d'accueil publique (vitrine) - fidele a la maquette Figma
                    (export Anima nettoye). Icones et forme de pied de page SVG
                    du projet. Navigation branchee vers Login et les routes internes
                    deja definies (PrivateRoute redirige vers /login si besoin).
Propriétaire     : Josué BEDEL
Date de création : 01/09/2026

*/

import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useTypewriter, useTypewriterLoop } from '../../hooks/useTypewriter'
import { keyframes } from '@emotion/react'
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'

import { useAuth } from '../../contexts/AuthContext'
import SpecularButton from '../../components/common/SpecularButton'
import { useSlowScroll } from '../../hooks/useSlowScroll'

import backgroundPic from '../../assets/background/backgroundpic.png'
import logoMairie from '../../assets/icons/logo.svg'
import iconProfil from '../../assets/icons/icon-profil.svg'
import iconEquipements from '../../assets/icons/equipements-icon.svg'
import iconDashboard from '../../assets/icons/dashboard-icon.svg'
import iconPannes from '../../assets/icons/pannes-icon.svg'
import iconStar from '../../assets/icons/star.svg'
import iconArrowLeft from '../../assets/icons/arrow-left.svg'
import iconArrowRight from '../../assets/icons/arrow-right.svg'
import iconPhone from '../../assets/icons/phone-icon.svg'
import iconMail from '../../assets/icons/mail-icon.svg'
import iconGlobe from '../../assets/icons/globe-icon.svg'
import iconHelp from '../../assets/icons/help-icon.svg'
import footerShape from '../../assets/icons/footer-shape.svg'

// GESTION (/gestion/utilisateurs) et HISTORIQUE (/gestion/suivi) retires :
// reserves a ADMIN_INFO/RESPONSABLE_DSI/TECHNICIEN cote RoleRoute, un agent
// (role par defaut a l'inscription) qui cliquerait dessus serait renvoye
// silencieusement vers /dashboard sans explication.

const TITRE_ACCUEIL =
  'LA GESTION DU PARC INFORMATIQUE DE LA COMMUNE DU GOLFE 1 CENTRALISEE ET SIMPLIFIEE'

const clignotementCurseur = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`
const NAV_ITEMS = [
  { id: 'accueil', label: 'ACCUEIL', to: '/' },
  { id: 'rapports', label: 'RAPPORTS', to: '/dashboard' },
  { id: 'contact', label: 'CONTACT', href: '#contact' },
]

const FEATURE_ITEMS = [
  {
    title: 'SUIVI DES EQUIPEMENTS',
    icon: iconEquipements,
    to: '/parc/equipements',
    iconWidth: { xs: 170, md: 270 },
    iconHeight: { xs: 90, md: 124 },  // ← et ici
  },
  {
    title: 'GESTION DES ACTIFS ET TABLEAU DE BORD',
    icon: iconDashboard,
    to: '/dashboard',
    iconWidth: { xs: 80, md: 370 },   // ← modifie ici pour celle-là
    iconHeight: { xs: 70, md: 114 },  // ← et ici
  },
  {
    title: 'GESTION DES PANNES',
    icon: iconPannes,
    to: '/assistance/pannes',
    // /assistance/pannes est reserve a TECHNICIEN/ADMIN_INFO/RESPONSABLE_DSI ;
    // un AGENT (role par defaut) y est refuse par RoleRoute et bounce vers
    // /dashboard. On l'envoie plutot vers la page qui lui est ouverte.
    toAgent: '/assistance/mes-signalements',
    iconWidth: { xs: 80, md: 270 },
    iconHeight: { xs: 70, md: 114 },
  },
]

const SOLUTION_SLIDES = [
  'GPI regroupe en un seul outil web tout le cycle de vie des équipements - Inventaire, Localisation, Panne et Intervention - GPI est accessible en temps réel depuis n’importe quelle annexe.',
  'Un inventaire unique, des codes QR et une cartographie des emplacements pour savoir où se trouve chaque équipement de la Commune.',
  'Signalez une panne, suivez l’intervention et conservez l’historique complet : plus de registres papier, une traçabilité en temps réel.',
]

const CONTACT_ITEMS = [
  {
    text: '+228 97 13 75 76 / +228 70 67 43 16',
    icon: iconPhone,
    href: 'tel:+22897137576',
  },
  {
    text: 'communegolfe1@gmail.com',
    icon: iconMail,
    href: 'mailto:communegolfe1@gmail.com',
  },
  {
    text: 'www.golfe1.mairie.tg',
    icon: iconGlobe,
    href: 'https://www.golfe1.mairie.tg',
    external: true,
  },
  {
    text: "Besoin d'aide ?",
    icon: iconHelp,
    href: 'mailto:communegolfe1@gmail.com',
  },
]

function IconImg({ src, size, alt = '', sx, ...props }) {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{ width: size, height: size, objectFit: 'contain', display: 'block', ...sx }}
      {...props}
    />
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [activeNavigation, setActiveNavigation] = useState('accueil')
  const { texteAffiche: titreAffiche, termine: titreTermine } = useTypewriter(TITRE_ACCUEIL, {
    vitesse: 35,
  })
  //useSlowScroll()
  const { texteAffiche: slideAffiche, index: slideIndex, definirIndex: definirSlideIndex } =
    useTypewriterLoop(SOLUTION_SLIDES)

  function allerVersConnexionOuEspace() {
    navigate(isAuthenticated ? '/dashboard' : '/login')
  }

  function handleNavigationClick(item) {
    setActiveNavigation(item.id)
    if (item.href) {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (item.to) {
      navigate(item.to)
    }
  }

  function handleFeatureClick(feature) {
    if (feature.toAgent && isAuthenticated && user?.role === 'AGENT') {
      navigate(feature.toAgent)
      return
    }
    navigate(feature.to)
  }

  function slidePrecedent() {
    definirSlideIndex(slideIndex === 0 ? SOLUTION_SLIDES.length - 1 : slideIndex - 1)
  }

  function slideSuivant() {
    definirSlideIndex(slideIndex === SOLUTION_SLIDES.length - 1 ? 0 : slideIndex + 1)
  }
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
        fontFamily: '"Quicksand", "Helvetica", sans-serif',
        backgroundImage: ` linear-gradient(
                                             rgba(204, 204, 204, 0.73),
                                             rgba(201, 201, 201, 0.8)
                                       ),
                                       url(${backgroundPic})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',

      }}
    >
      <Box
        component="header"
        sx={{
          bgcolor: '#1b7548',
          borderBottom: '2px solid #d9d9d9',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.22)',
        }}
      >
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            minHeight: { xs: 66, md: 104 },
            px: { xs: 1.25, md: 2.25 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Stack
            component={RouterLink}
            to="/"
            direction="row"
            spacing={{ xs: 1, md: 2 }}
            alignItems="center"
            onClick={() => setActiveNavigation('accueil')}
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Box
              component="img"
              src={logoMairie}
              alt="Logo de la Mairie du Golfe 1"
              sx={{
                width: { xs: 42, md: 72 },
                height: { xs: 42, md: 61 },
                objectFit: 'contain',
              }}
            />
            <Typography
              sx={{
                color: '#fef7ff',
                fontWeight: 700,
                fontSize: { xs: '1.25rem', md: '2.5rem' },
                whiteSpace: 'nowrap',
              }}
            >
              GPI - CG1
            </Typography>
          </Stack>

          <Stack
            component="nav"
            direction="row"
            alignItems="center"
            spacing={{ md: 1.5, lg: 3 }}
            sx={{ display: { xs: 'none', md: 'flex' } }}
            aria-label="Navigation principale"
          >
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.id}
                onClick={() => handleNavigationClick(item)}
                disableRipple
                sx={{
                  minWidth: 0,
                  px: 0,
                  py: 1,
                  borderRadius: 0,
                  color: activeNavigation === item.id ? '#a8ff94' : '#fef7ff',
                  fontSize: item.id === 'accueil' ? '1.35rem' : '1rem',
                  fontWeight: 700,
                  borderBottom:
                    activeNavigation === item.id
                      ? '3px solid #a8ff94'
                      : '3px solid transparent',
                  transition: 'color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: '#a8ff94',
                    borderBottom: '3px solid #a8ff94',
                    transform: 'scale(1.08)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
            <Button
              onClick={allerVersConnexionOuEspace}
              sx={{
                color: '#fef7ff',
                fontWeight: 700,
                fontSize: '1rem',
                whiteSpace: 'nowrap',
                borderRadius: 0,
                borderBottom: '3px solid transparent',
                transition: 'color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                '&:hover': {
                  bgcolor: 'transparent',
                  color: '#a8ff94',
                  borderBottom: '3px solid #a8ff94',
                  transform: 'scale(1.08)',
                },
              }}
            >
              {isAuthenticated ? 'MON ESPACE' : 'SE CONNECTER'}
            </Button>
            <Box
              component="img"
              src={iconProfil}
              alt=""
              aria-hidden="true"
              sx={{ width: 28, height: 28, filter: 'brightness(0) invert(1)' }}
            />
          </Stack>

          <IconButton
            onClick={allerVersConnexionOuEspace}
            aria-label={isAuthenticated ? 'Mon espace' : 'Se connecter'}
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              color: '#fef7ff',
            }}
          >
            <IconImg src={iconProfil} size={28} sx={{ filter: 'brightness(0) invert(1)' }} />
          </IconButton>
        </Container>
      </Box>

      <Container
        maxWidth={false}
        sx={{
          //maxWidth: '1800px',
          px: { xs: 3, md: 11 },
          pt: { xs: 4, md: 7 },
        }}
      >
        <Box sx={{ position: 'relative', width: '100%' }}>
          {/* Version invisible, texte complet - reserve l'espace final sans jamais etre visible */}
          <Typography
            component="h1"
            aria-hidden="true"
            sx={{
              visibility: 'hidden',
              color: '#08060d',
              fontFamily: '"Quicksand", "Helvetica", sans-serif',
              fontSize: { xs: '1.65rem', md: '3.8rem' },
              fontWeight: 700,
              letterSpacing: { xs: '0.08em', md: '0.10em' },
              lineHeight: 1.15,
              margin: 0,
              textAlign: 'center',
            }}
          >
            {TITRE_ACCUEIL}
          </Typography>

          {/* Version animee, superposee exactement au meme endroit */}
          <Typography
            component="h1"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              color: '#08060d',
              fontFamily: '"Quicksand", "Helvetica", sans-serif',
              fontSize: { xs: '1.65rem', md: '3.8rem' },
              fontWeight: 700,
              letterSpacing: { xs: '0.08em', md: '0.10em' },
              lineHeight: 1.15,
              margin: 0,
              textAlign: 'center',
            }}
          >
            {titreAffiche}
            {!titreTermine && (
              <Box
                component="span"
                sx={{ animation: `${clignotementCurseur} 0.8s step-end infinite` }}
              >
                |
              </Box>
            )}
          </Typography>
        </Box>
        <Typography
          sx={{
            mt: 1,
            color: 'rgba(63, 60, 60, 0.76)',
            fontSize: { xs: '0.85rem', md: '1.875rem' },
            fontWeight: 600,
            letterSpacing: { xs: '-0.04em', md: '-0.065em' },
            textAlign: 'left',
          }}
        >
          Un outil unique pour suivre et tracer les équipements informatiques de la
          Commune du Golfe 1
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={{ mt: { xs: 3, md: 6 } }}
        >
          <Box sx={{ height: 8, bgcolor: '#e40017', flex: 1, borderRadius: '50%' }} />
          <Box
            component="img"
            src={iconStar}
            alt=""
            aria-hidden="true"
            sx={{ height: { xs: 30, md: 56 }, width: 'auto' }}
          />
          <Box sx={{ height: 8, bgcolor: '#e40017', flex: 1, borderRadius: '50%' }} />
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-around"
          alignItems="stretch"
          spacing={{ xs: 4, md: 6 }}
          sx={{ mt: { xs: 4, md: 2 }, pb: { xs: 4, md: 3 } }}
        >
          {FEATURE_ITEMS.map((feature) => (
            <Stack
              key={feature.title}
              component="button"
              type="button"
              onClick={() => handleFeatureClick(feature)}
              alignItems="center"
              justifyContent="center"
              spacing={1}
              sx={{
                flex: 1,
                minHeight: { md: 230 },
                border: 0,
                bgcolor: 'transparent',
                color: 'inherit',
                cursor: 'none',
                font: 'inherit',
                '&:hover img': { transform: 'scale(1.03)' },
              }}
            >
              <Box
                component="img"
                src={feature.icon}
                alt=""
                aria-hidden="true"
                sx={{
                  width: feature.iconWidth,
                  objectFit: 'contain',
                  transition: 'transform 0.5s ease-in-out',
                }}
              />
              <Typography
                align="center"
                sx={{
                  maxWidth: 340,
                  color: '#08060d',
                  fontSize: { xs: '0.78rem', md: '1.125rem' },
                  lineHeight: 1.12,
                  fontWeight: 700,
                  letterSpacing: { xs: '0.18em', md: '0.29em' },
                }}
              >
                {feature.title}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Container>

      <Box
        component="section"
        aria-label="Présentation de la solution"
        sx={{
          bgcolor: '#1b7548',
          minHeight: { xs: 105, md: 196 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '3px solid #d9d9d9',
          borderBottom: '3px solid #d9d9d9',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 4 }}>
          <Divider
            sx={{
              width: { xs: 90, md: 510 },
              borderColor: '#a8ff94',
              borderRadius: 50,
              borderTopWidth: 4,
              borderBottomWidth: 4,
            }}
          />
          <Box
            component="img"
            src={logoMairie}
            alt="Logo de la Mairie du Golfe 1"
            sx={{
              width: { xs: 90, md: 190 },
              height: { xs: 90, md: 190 },
              objectFit: 'contain',
            }}
          />
          <Divider
            sx={{
              width: { xs: 90, md: 510 },
              borderColor: '#a8ff94',
              borderRadius: 50,
              borderTopWidth: 4,
              borderBottomWidth: 4,
            }}
          />
        </Stack>
      </Box>

      <Container
        maxWidth={false}
        sx={{
          //maxWidth: '1800px',
          px: { xs: 3, md: 9 },
          pt: { xs: 3, md: 5 },
        }}
      >
        <Stack alignItems="center" spacing={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <IconButton onClick={slidePrecedent} aria-label="Solution précédente">
              <Box
                component="img"
                src={iconArrowLeft}
                alt=""
                sx={{ width: { xs: 30, md: 55 }, height: { xs: 30, md: 55 } }}
              />
            </IconButton>
            <Typography
              align="center"
              sx={{
                maxWidth: 1300,
                color: 'rgba(80, 78, 78, 0.72)',
                fontSize: { xs: '0.95rem', md: '1.75rem' },
                fontWeight: 600,
                letterSpacing: { xs: '0.08em', md: '0.16em' },
                lineHeight: 1.2,
                minHeight: { md: 126 },
              }}
            >
              <Typography
                align="center"
                sx={{
                  maxWidth: 1300,
                  color: 'rgba(80, 78, 78, 0.72)',
                  fontSize: { xs: '0.95rem', md: '1.75rem' },
                  fontWeight: 600,
                  letterSpacing: { xs: '0.08em', md: '0.16em' },
                  lineHeight: 1.2,
                  minHeight: { md: 126 },
                }}
              >
                {slideAffiche}
                <Box
                  component="span"
                  sx={{ animation: `${clignotementCurseur} 0.8s step-end infinite` }}
                >
                  |
                </Box>
              </Typography>
            </Typography>
            <IconButton onClick={slideSuivant} aria-label="Solution suivante">
              <Box
                component="img"
                src={iconArrowRight}
                alt=""
                sx={{ width: { xs: 30, md: 55 }, height: { xs: 30, md: 55 } }}
              />
            </IconButton>
          </Stack>
          <Typography
            component="h2"
            sx={{
              color: '#08060d',
              fontFamily: '"Quicksand", "Helvetica", sans-serif',
              fontSize: { xs: '1rem', md: '2rem' },
              fontWeight: 700,
              letterSpacing: { xs: '0.17em', md: '0.18em' },
              margin: 0,
            }}
          >
            LA SOLUTION
          </Typography>
        </Stack>

        <Divider
          sx={{
            mt: { xs: 7, md: 10 },
            mx: { xs: 2, md: 5 },
            borderColor: '#e40017',
            borderRadius: 100,
            borderBottomWidth: 7,
          }}
        />

        <Stack
          alignItems="center"
          spacing={3}
          sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 5, md: 7 } }}
        >
          <Typography
            component="h2"
            align="center"
            sx={{
              color: '#08060d',
              fontFamily: '"Quicksand", "Helvetica", sans-serif',
              fontSize: { xs: '1.7rem', md: '3.75rem' },
              fontWeight: 700,
              letterSpacing: { xs: '0.13em', md: '0.23em' },
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            COMMENCER MAINTENANT ?
          </Typography>
          <SpecularButton
            onClick={allerVersConnexionOuEspace}
            size="lg"
            radius={12}
            tint="#1b7548"
            tintOpacity={1}
            textColor="#fef7ff"
            lineColor="#000000"
            baseColor="#145d39"
            intensity={12}
            shineSize={22}
            shineFade={45}
            thickness={12}
            speed={0.6}
            followMouse
            proximity={280}
            autoAnimate
          >
            {isAuthenticated ? 'ACCÉDER À MON ESPACE' : 'SE CONNECTER'}
          </SpecularButton>
        </Stack>
      </Container>

      <Box
        component="footer"
        id="contact"
        sx={{
          position: 'relative',
          mt: { xs: 4, md: 8 },
          color: '#d9d9d9',
        }}
      >
        <Box
          component="img"
          src={footerShape}
          alt=""
          aria-hidden="true"
          sx={{
            display: 'block',
            width: '100%',
            minHeight: { xs: 280, md: 120 },
            objectFit: 'cover',
            objectPosition: 'top',
            marginBottom: { xs: -1, md: -2 },
          }}
        />
        <Container
          maxWidth={false}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            //maxWidth: '1800px',
            px: { xs: 3, md: 5 },
            pb: { xs: 3, md: 4 },
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={{ xs: 5, md: 4 }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  component="img"
                  src={logoMairie}
                  alt=""
                  aria-hidden="true"
                  sx={{ width: { xs: 36, md: 70 }, height: { xs: 36, md: 70 }, objectFit: 'contain' }}
                />
                <Typography
                  sx={{
                    fontSize: { xs: '1.5rem', md: '3rem' },
                    fontWeight: 700,
                    color: '#d9d9d9',
                  }}
                >
                  GPI - CG1
                </Typography>
              </Stack>
              <Typography
                sx={{ fontSize: { xs: '1rem', md: '2rem' }, fontWeight: 700, color: '#d9d9d9' }}
              >
                Mairie de Golfe 1 - Bè-Afédomé
              </Typography>
              <Divider sx={{ width: { xs: 300, md: 620 }, borderColor: '#d9d9d9', borderWidth: 4 }} />
              <Typography
                sx={{
                  fontSize: { xs: '0.72rem', md: '1.5rem' },
                  fontWeight: 600,
                  color: '#d9d9d9',
                }}
              >
                36, Avenue Bè-Pa Souza | B.P: 62356 Lomé TOGO
              </Typography>
            </Stack>
            <Stack spacing={1.5} sx={{ pt: { md: 2 } }}>
              {CONTACT_ITEMS.map((item) => (
                <Stack
                  key={item.text}
                  component="a"
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    width: 'fit-content',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      '& .footer-link-text': {
                        textDecoration: 'underline',
                        textUnderlineOffset: '4px',
                      },
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    sx={{
                      width: { xs: 28, md: 36 },
                      height: { xs: 28, md: 36 },
                      objectFit: 'contain',
                    }}
                  />
                  <Typography
                    className="footer-link-text"
                    sx={{
                      fontSize: { xs: '0.85rem', md: '1.45rem' },
                      fontWeight: 600,
                      color: '#d9d9d9',
                    }}
                  >
                    {item.text}
                  </Typography>
                </Stack>
              ))}
              <Divider sx={{ width: { xs: 220, md: 300 }, borderColor: '#d9d9d9', borderWidth: 4, borderRadius: 50 }} />
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}