/*

Nom du fichier   : Register.jsx
Objectif         : Page d'inscription fidele a la maquette Figma (via Anima, nettoye) - formes decoratives SVG reelles, mot de passe 6 caracteres min aligne sur le backend
Propriétaire     : Josué BEDEL
Date de création : 30/08/2026

*/

import { useState } from 'react'
import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { keyframes } from '@emotion/react'

import blobGreen from '../../assets/icons/blob-green.svg'
import blobTeal from '../../assets/icons/blob-teal.svg'
import keyboardIcon from '../../assets/icons/keyboard.svg'
import printerIcon from '../../assets/icons/printer.svg'
import eyeOffIcon from '../../assets/icons/eye-off.svg'

const defilementInfini = keyframes`
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0%);
  }
`
const formFields = [
    { id: 'nom', label: 'Nom', placeholder: 'nom...', type: 'text' },
    { id: 'prenom', label: 'Prénoms', placeholder: 'prenoms...', type: 'text' },
    { id: 'email', label: 'Email', placeholder: 'emailadress@gmail.com', type: 'email' },
    {
        id: 'motDePasse',
        label: 'Mot De Passe',
        placeholder: 'au moins 6 caractères',
        type: 'password',
    },
]

const featureCards = [
    {
        title: 'Gestion des actifs',
        description:
            'Centralise tout le parc informatique : Matériel, logiciels et réseau. Axée sur le suivi de chaque équipement',
    },
    {
        title: 'Gestion des pannes',
        description:
            'Signalez un problème en quelques clics et suivez en temps réel le traitement de cette dernière',
    },
    {
        title: 'Suivi',
        description:
            'Retracez l\'historique complet de chaque équipement : pannes, interventions et mouvements, en un seul endroit',
    },
]

export default function Register() {
    const [formValues, setFormValues] = useState({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
    })
    const [showPassword, setShowPassword] = useState(false)

    function handleChange(event) {
        const { name, value } = event.target
        setFormValues((valeursActuelles) => ({
            ...valeursActuelles,
            [name]: value,
        }))
    }

    function handleSubmit(event) {
        event.preventDefault()
        // La logique d'appel a authApi.register et le passage a l'etape
        // de verification par code sera branchee ici.
    }

    return (
        <Box
            component="main"
            sx={{
                position: 'relative',
                display: 'grid',
                minHeight: '100vh',
                placeItems: 'center',
                overflow: 'hidden',
                bgcolor: 'rgba(255,255,255,0.89)',
                px: { xs: 2, sm: 4 },
                py: { xs: 6, md: 8 },
            }}
        >
            <Box
                component="img"
                src={blobTeal}
                alt=""
                aria-hidden="true"
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: { xs: 220, md: 340 },
                }}
            />
            <Box
                component="img"
                src={blobGreen}
                alt=""
                aria-hidden="true"
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: { xs: 260, md: 420 },
                }}
            />

            <Box
                component="img"
                src={keyboardIcon}
                alt=""
                aria-hidden="true"
                sx={{
                    position: 'absolute',
                    top: '45%',
                    left: '2%',
                    width: { xs: 28, md: 38 },
                    transform: 'rotate(-37deg)',
                }}
            />
            <Box
                component="img"
                src={keyboardIcon}
                alt=""
                aria-hidden="true"
                sx={{
                    position: 'absolute',
                    top: '56%',
                    right: '4%',
                    width: { xs: 28, md: 38 },
                    transform: 'rotate(-37deg)',
                }}
            />
            <Box
                component="img"
                src={printerIcon}
                alt=""
                aria-hidden="true"
                sx={{
                    position: 'absolute',
                    top: '9%',
                    left: '34%',
                    width: { xs: 28, md: 40 },
                    transform: 'rotate(29deg)',
                }}
            />
            <Box
                component="img"
                src={printerIcon}
                alt=""
                aria-hidden="true"
                sx={{
                    position: 'absolute',
                    bottom: '9%',
                    left: '54%',
                    width: { xs: 28, md: 40 },
                    transform: 'rotate(-31deg)',
                }}
            />

            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    width: 'min(83.6vw, 1204px)',
                    aspectRatio: '1204 / 668',
                    overflow: 'hidden',
                    borderRadius: { xs: 3, md: '45px' },
                    boxShadow: '-20px 13px 8.7px rgba(0,0,0,0.16)',
                    bgcolor: '#d9d9d9',
                }}
            >
                <Box
                    component="section"
                    aria-labelledby="registration-title"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '55.8%',
                        px: '5.8%',
                        pt: '4.3%',
                        pb: '3.5%',
                    }}
                >
                    <Stack alignItems="center" spacing={0} sx={{ width: '100%', mb: '4.2%' }}>
                        <Typography
                            id="registration-title"
                            component="h1"
                            sx={{
                                color: '#000',
                                fontFamily: 'Quicksand, sans-serif',
                                fontSize: 'clamp(15px, 2.8vw, 40px)',
                                fontWeight: 700,
                                lineHeight: 1.1,
                                textAlign: 'center',
                            }}
                        >
                            Bienvenue sur GPI-CG1
                        </Typography>
                        <Typography
                            sx={{
                                mt: '2%',
                                color: 'rgba(78,75,75,0.78)',
                                fontFamily: 'Quicksand, sans-serif',
                                fontSize: 'clamp(8px, 1.55vw, 22px)',
                                fontWeight: 600,
                                lineHeight: 1.2,
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Entrez vos informations pour créer votre compte
                        </Typography>
                    </Stack>

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                            justifyContent: 'space-between',
                            pt: '1%',
                        }}
                    >
                        <Stack spacing={{ xs: 0.8, md: 1.5 }}>
                            {formFields.map((field) => (
                                <Box key={field.id}>
                                    <Typography
                                        component="label"
                                        htmlFor={field.id}
                                        sx={{
                                            display: 'block',
                                            mb: '1.2%',
                                            color: '#000',
                                            fontFamily: 'Quicksand, sans-serif',
                                            fontSize: 'clamp(8px, 1.25vw, 18px)',
                                            fontWeight: 700,
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {field.label}
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        id={field.id}
                                        name={field.id}
                                        type={field.type === 'password' && showPassword ? 'text' : field.type}
                                        value={formValues[field.id]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        variant="outlined"
                                        inputProps={field.type === 'password' ? { minLength: 6 } : undefined}
                                        InputProps={
                                            field.type === 'password'
                                                ? {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label={
                                                                    showPassword
                                                                        ? 'Masquer le mot de passe'
                                                                        : 'Afficher le mot de passe'
                                                                }
                                                                edge="end"
                                                                onClick={() => setShowPassword((visible) => !visible)}
                                                                size="small"
                                                                sx={{ mr: '1%' }}
                                                            >
                                                                <Box
                                                                    component="img"
                                                                    src={eyeOffIcon}
                                                                    alt=""
                                                                    sx={{ width: 'clamp(14px, 2.1vw, 30px)' }}
                                                                />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }
                                                : undefined
                                        }
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: 'clamp(29px, 4.8vw, 49px)',
                                                borderRadius: '13px',
                                                bgcolor: '#b2bdb4',
                                                color: '#000',
                                                fontFamily: 'Quicksand, sans-serif',
                                                fontSize: 'clamp(10px, 1.4vw, 20px)',
                                                fontWeight: 600,
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 0,
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                px: '3%',
                                                py: 0,
                                            },
                                            '& .MuiOutlinedInput-input::placeholder': {
                                                color: '#8c8c8c',
                                                opacity: 1,
                                            },
                                        }}
                                    />
                                </Box>
                            ))}
                        </Stack>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '3%' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    minWidth: '41.5%',
                                    height: 'clamp(29px, 4.8vw, 49px)',
                                    borderRadius: '13px',
                                    bgcolor: '#1b7548',
                                    color: '#8fffc7',
                                    fontFamily: 'Quicksand, sans-serif',
                                    fontSize: 'clamp(7px, 1vw, 15px)',
                                    fontWeight: 700,
                                    letterSpacing: '0.22em',
                                    '&:hover': {
                                        bgcolor: '#146f42',
                                    },
                                }}
                            >
                                SOUMETTRE
                            </Button>
                        </Box>
                    </Box>
                </Box>

                <Box
                    component="section"
                    aria-labelledby="platform-title"
                    sx={{
                        position: 'relative',
                        width: '44.2%',
                        px: '4.7%',
                        pt: '6.7%',
                        overflow: 'hidden',
                        bgcolor: '#1b7548',
                        borderRadius: { xs: 0, md: '49px 0 0 49px' },
                        '&::after': {
                            position: 'absolute',
                            top: '30%',
                            right: 0,
                            bottom: 0,
                            left: 0,
                            content: '""',
                            backgroundImage:
                                'radial-gradient(circle, rgba(194,255,215,0.85) 1.2px, transparent 1.4px)',
                            backgroundSize: '20px 20px',
                            opacity: 0.9,
                        },
                    }}
                >
                    <Typography
                        id="platform-title"
                        component="h2"
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            color: '#fff',
                            fontFamily: 'Quicksand, sans-serif',
                            fontSize: 'clamp(14px, 2.5vw, 36px)',
                            fontWeight: 600,
                            lineHeight: 1.18,
                        }}
                    >
                        Plateforme de Gestion Du Parc Informatique de la Commune du Golfe 1
                    </Typography>

                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            mt: '16%',
                            overflow: 'hidden',
                            width: '100%',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                width: 'max-content',
                                gap: '4%',
                                animation: `${defilementInfini} 20s linear infinite`,
                                '&:hover': {
                                    animationPlayState: 'paused',
                                },
                            }}
                        >
                            {[...featureCards, ...featureCards].map((feature, index) => (
                                <Card
                                    key={`${feature.title}-${index}`}
                                    elevation={0}
                                    sx={{
                                        display: 'flex',
                                        width: 'clamp(140px, 20vw, 220px)',
                                        flexShrink: 0,
                                        minHeight: 'clamp(118px, 22.7vw, 229px)',
                                        borderRadius: '12px',
                                        bgcolor: '#d9d9d9',
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            width: '100%',
                                            p: '13% !important',
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                color: '#000',
                                                fontFamily: 'Quicksand, sans-serif',
                                                fontSize: 'clamp(8px, 1.18vw, 17px)',
                                                fontWeight: 700,
                                                lineHeight: 1.12,
                                            }}
                                        >
                                            {feature.description}
                                        </Typography>
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing="7%"
                                            sx={{ mt: 'auto', pt: '7%' }}
                                        >
                                            <Box
                                                aria-hidden="true"
                                                sx={{
                                                    display: 'grid',
                                                    width: 'clamp(23px, 4.1vw, 50px)',
                                                    height: 'clamp(23px, 4.1vw, 47px)',
                                                    placeItems: 'center',
                                                    flexShrink: 0,
                                                    borderRadius: '50%',
                                                    bgcolor: '#0f2a14',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: '68%',
                                                        height: '72%',
                                                        borderRadius: '50%',
                                                        bgcolor: '#1b7548',
                                                        display: 'grid',
                                                        placeItems: 'center',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: '62%',
                                                            height: '68%',
                                                            borderRadius: '50%',
                                                            bgcolor: '#df0a0d',
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                            <Typography
                                                sx={{
                                                    color: '#000',
                                                    fontFamily: 'Quicksand, sans-serif',
                                                    fontSize: 'clamp(6px, 0.84vw, 12px)',
                                                    fontWeight: 700,
                                                    lineHeight: 1.1,
                                                }}
                                            >
                                                {feature.title}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>   
                </Box>
            </Box>
        </Box>
    )
}