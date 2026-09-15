/*

Nom du fichier   : SplashScreen.jsx
Objectif         : Ecran de chargement plein ecran (blason + barre de
                    progression en 3 paliers sur ~2 secondes) affiche a
                    l'arrivee sur le site (restauration de session) et en
                    transition apres connexion/inscription
Propriétaire     : Josué BEDEL
Date de création : 14/09/2026
Date de mise à jour : 14/09/2026
Objet de mise à jour : Progression en 3 paliers distincts ("tok tok tok",
                        ease-out) au lieu d'une animation lineaire continue

*/

import { useEffect, useState } from 'react'
import { Box, LinearProgress } from '@mui/material'

import backgroundPic from '../../assets/background/backgroundpic.png'
import logo from '../../assets/icons/logo.svg'

const PALIERS = [
    { valeur: 35, delai: 0 },
    { valeur: 70, delai: 650 },
    { valeur: 100, delai: 1350 },
]

const DUREE_PALIER_MS = 700

export default function SplashScreen({ progress }) {
    const [progressionSimulee, setProgressionSimulee] = useState(0)

    useEffect(() => {
        if (progress != null) return
        const minuteurs = PALIERS.map(({ valeur, delai }) =>
            setTimeout(() => setProgressionSimulee(valeur), delai)
        )
        return () => minuteurs.forEach(clearTimeout)
    }, [progress])

    const valeurAffichee = progress != null ? progress : progressionSimulee

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fff',
                backgroundImage: ` linear-gradient( rgba(252, 249, 249, 0.55), rgba(240, 238, 238, 0.49)),url(${backgroundPic})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <Box component="img" src={logo} alt="Mairie du Golfe 1" sx={{ width: { xs: 140, sm: 180 }, height: 'auto', mb: 6 }} />
            <LinearProgress
                variant="determinate"
                value={valeurAffichee}
                sx={{
                    width: { xs: '70%', sm: 420 },
                    height: 8,
                    borderRadius: 999,
                    bgcolor: '#e5e7eb',
                    '& .MuiLinearProgress-bar': {
                        bgcolor: '#1b7548',
                        borderRadius: 999,
                        transition: progress == null ? `transform ${DUREE_PALIER_MS}ms cubic-bezier(0.2, 0.8, 0.3, 1)` : undefined,
                    },
                }}
            />
        </Box>
    )
}