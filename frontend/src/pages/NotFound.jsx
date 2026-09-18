/*

Nom du fichier   : NotFound.jsx
Objectif         : Page 404 (route inconnue) - illustration NoDataSvg recoloree
                    aux couleurs du theme GPI-CG1, animations d'entree en fondu
                    + illustration flottante, bouton retour avec effet glare
Propriétaire     : Josué BEDEL
Date de création : 18/09/2026

*/

import { Box, Button, GlobalStyles, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { NoDataSvg } from '../components/common/NoDataSvg'
import GlareHover from '../components/common/GlareHover'


export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <GlobalStyles
        styles={{
          '@keyframes gpi404Float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-14px)' },
          },
          '@keyframes gpi404FadeUp': {
            from: { opacity: 0, transform: 'translateY(18px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      />

      <Stack alignItems="center" spacing={0} sx={{ maxWidth: 460, textAlign: 'center' }}>
        <Typography
          sx={{
            fontFamily: 'Quicksand, sans-serif',
            fontWeight: 700,
            fontSize: { xs: '3.5rem', sm: '4.5rem' },
            lineHeight: 1,
            color: 'primary.main',
            opacity: 0,
            animation: 'gpi404FadeUp 0.6s ease-out forwards',
          }}
        >
          404
        </Typography>

        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            mt: 1,
            opacity: 0,
            animation:
              'gpi404FadeUp 0.6s ease-out 0.1s forwards, gpi404Float 4s ease-in-out 0.7s infinite',
          }}
        >
          <NoDataSvg color="#1B7A4D" style={{ width: '100%', height: 'auto' }} />
        </Box>

        <Typography
          component="h1"
          sx={{
            mt: 3,
            mb: 1,
            fontFamily: 'Quicksand, sans-serif',
            fontWeight: 700,
            fontSize: { xs: '1.3rem', sm: '1.5rem' },
            color: 'text.primary',
            opacity: 0,
            animation: 'gpi404FadeUp 0.6s ease-out 0.2s forwards',
          }}
        >
          Oups, cette page est introuvable.
        </Typography>

        <Typography
          sx={{
            mb: 4,
            fontFamily: 'Quicksand, sans-serif',
            color: 'text.secondary',
            opacity: 0,
            animation: 'gpi404FadeUp 0.6s ease-out 0.3s forwards',
          }}
        >
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </Typography>

        <Box sx={{ opacity: 0, animation: 'gpi404FadeUp 0.6s ease-out 0.4s forwards' }}>
          <GlareHover
            width="230px"
            height="48px"
            background="transparent"
            borderRadius="999px"
            borderColor="transparent"
            glareColor="#ffffff"
            glareOpacity={0.35}
            glareAngle={-30}
            transitionDuration={700}
          >
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              color="secondary"
              sx={{ width: '100%', height: '100%' }}
            >
              Retour à l&apos;accueil
            </Button>
          </GlareHover>
        </Box>
      </Stack>
    </Box>
  )
}