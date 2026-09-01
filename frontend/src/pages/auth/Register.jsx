/*

Nom du fichier   : Register.jsx
Objectif         : Page d'inscription fidele a la maquette Figma 
                    (via Anima, nettoye) - formes decoratives SVG
                     reelles, mot de passe 6 caracteres min aligne sur le backend
                     Layout responsive : colonnes cote a cote a partir de md,
                     empilement vertical en dessous, carrousel infini remplace
                     par un empilement statique des featureCards sur mobile/tablette
Propriétaire     : Josué BEDEL
Date de création : 30/08/2026

*/

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Fade,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { keyframes } from '@emotion/react'
import GlareHover from '../../components/common/GlareHover'
import SpecularButton from '../../components/common/SpecularButton'
import backgroundPic from '../../assets/background/backgroundpic.png'
import { authApi } from '../../api/authApi'
import VerifyEmail from '../../components/auth/VerifyEmail'

import blobGreen from '../../assets/icons/blob-green.svg'
import blobTeal from '../../assets/icons/blob-teal.svg'
import keyboardIcon from '../../assets/icons/keyboard.svg'
import printerIcon from '../../assets/icons/printer.svg'
import eyeOffIcon from '../../assets/icons/eye-off.svg'
import logoMairie from '../../assets/icons/logo.svg'


const defilementInfini = keyframes`
  from {
    transform: translateX(0%);
  }
  to {
    transform: translateX(-50%);
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

function FeatureCard({ feature }) {
    return (
        <Card
            elevation={0}
            sx={{
                display: 'flex',
                width: { xs: '100%', sm: 'clamp(180px, 40vw, 270px)' },
                minWidth: 0,
                flexShrink: 0,
                minHeight: { xs: 'auto', sm: 'clamp(118px, 22.7vw, 229px)' },
                borderRadius: '12px',
                bgcolor: '#d9d9d9',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginTop: { xs: 0, sm: 'clamp(20px, 2.5vw, 30px)' },
            }}
        >
            <GlareHover
                width="100%"
                height="100%"
                background="transparent"
                borderColor="transparent"
                borderRadius="12px"
                glareColor="#12832b"
                glareOpacity={0.55}
                glareAngle={-30}
                glareSize={200}
                transitionDuration={800}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'flex-start',
                }}
            >
                <CardContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: { xs: '100%', sm: '80%' },
                        minWidth: 0,
                        height: '100%',
                        p: { xs: '6% 5%', sm: '13% !important' },
                    }}
                >
                    <Typography
                        sx={{
                            color: '#000',
                            fontFamily: 'Quicksand, sans-serif',
                            fontSize: { xs: 14, sm: 'clamp(8px, 1.18vw, 17px)' },
                            fontWeight: 700,
                            lineHeight: 1.12,
                            overflowWrap: 'break-word',
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
                                width: { xs: 32, sm: 'clamp(23px, 4.1vw, 50px)' },
                                height: { xs: 32, sm: 'clamp(23px, 4.1vw, 47px)' },
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
                                fontSize: { xs: 11, sm: 'clamp(6px, 0.84vw, 12px)' },
                                fontWeight: 700,
                                lineHeight: 1.1,
                            }}
                        >
                            {feature.title}
                        </Typography>
                    </Stack>
                </CardContent>
            </GlareHover>
        </Card>
    )
}

export default function Register() {
    const navigate = useNavigate()

    const [formValues, setFormValues] = useState({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [focusedField, setFocusedField] = useState(null)
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState('')

    const [showForm, setShowForm] = useState(true)
    const [showVerify, setShowVerify] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState('')

    function handleChange(event) {
        const { name, value } = event.target
        setFormValues((valeursActuelles) => ({
            ...valeursActuelles,
            [name]: value,
        }))
    }



    async function handleSubmit(event) {
        event.preventDefault()
        setServerError('')
        setLoading(true)
        try {
            await authApi.register({
                nom: formValues.nom,
                prenom: formValues.prenom,
                email: formValues.email,
                motDePasse: formValues.motDePasse,
                role: 'AGENT', // impose cote frontend - coherent avec la decision de securite prise plus tot
            })
            // Inscription reussie : on bascule vers l'ecran de saisie du code
            // (VerifyEmail) au lieu d'aller directement vers /login, puisque le
            // backend exige la verification d'email avant d'autoriser la connexion.
            setRegisteredEmail(formValues.email)
            setShowForm(false) // declenche le fondu de sortie ; VerifyEmail prend le relais dans onExited
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                setServerError('Email ou mot de passe incorrect')
            } else {
                setServerError('Une erreur est survenue, veuillez réessayer')
            }
        } finally {
            setLoading(false)
        }
    }
    return (
        <Box
            component="main"
            sx={{
                position: 'relative',
                display: 'grid',
                minHeight: '100vh',
                height: { xs: 'auto', md: '100vh' },
                placeItems: 'center',
                overflow: 'hidden',
                overflowY: { xs: 'visible', md: 'hidden' },
                backgroundImage: ` linear-gradient(
                                    rgba(255, 255, 255, 0.69),
                                    rgba(255, 255, 255, 0.75)
                                ),
                                url(${backgroundPic})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                boxSizing: 'border-box',
                px: { xs: 2, sm: 4 },
                py: { xs: 3, md: 3 },
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
                    width: { xs: 140, sm: 220, md: 340 },
                    display: { xs: 'none', sm: 'block' },
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
                    width: { xs: 160, sm: 260, md: 420 },
                    display: { xs: 'none', sm: 'block' },
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
                    width: { md: 38 },
                    transform: 'rotate(-37deg)',
                    display: { xs: 'none', md: 'block' },
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
                    width: { md: 38 },
                    transform: 'rotate(-37deg)',
                    display: { xs: 'none', md: 'block' },
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
                    width: { md: 40 },
                    transform: 'rotate(29deg)',
                    display: { xs: 'none', md: 'block' },
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
                    width: { md: 40 },
                    transform: 'rotate(-31deg)',
                    display: { xs: 'none', md: 'block' },
                }}
            />

            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    width: { xs: '100%', md: 'min(92vw, 1400px)' },
                    maxWidth: '100%',
                    overflow: 'hidden',
                    borderRadius: { xs: 3, md: '45px' },
                    boxShadow: '-20px 13px 8.7px rgba(0,0,0,0.16)',
                    bgcolor: '#d9d9d9',
                }}
            >
                <Box
                    aria-hidden="true"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'absolute',
                        top: -15,
                        bottom: -15,
                        left: '55.8%',
                        transform: 'translateX(-30%)',
                        width: { md: 50 },
                        zIndex: 99,
                        pointerEvents: 'none',
                        background: '#d9d9d9',
                        filter: 'blur(8px)',

                    }}
                />

                <Box
                    component="section"
                    aria-labelledby="registration-title"
                    sx={{
                        position: 'relative',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        width: { xs: '100%', md: '55.8%' },
                        marginRight: { xs: 0, md: '-3%' },
                        boxShadow: { xs: 'none', md: '6px 0 16px rgba(0,0,0,0.2)' },
                        bgcolor: '#d9d9d9',
                        px: { xs: '6%', md: '5.8%' },
                        pt: { xs: '8%', md: '4.3%' },
                        pb: { xs: '6%', md: '3.5%' },
                    }}
                >
                    <Fade in={showForm} timeout={400} unmountOnExit onExited={() => setShowVerify(true)}>
                        <Box>
                            <Stack alignItems="left" spacing={0} sx={{ width: '100%', mb: '4.2%' }}>
                                <Box
                                    component="img"
                                    src={logoMairie}
                                    alt="Logo de la Mairie du Golfe 1"
                                    sx={{
                                        width: 'clamp(32px, 5.2vw, 64px)',
                                        mb: '1.5%',
                                    }}

                                />
                                <Typography
                                    id="registration-title"
                                    component="h1"
                                    sx={{
                                        color: '#000',
                                        fontFamily: 'Quicksand, sans-serif',
                                        fontSize: 'clamp(15px, 2.8vw, 40px)',
                                        fontWeight: 700,
                                        lineHeight: 1.1,
                                        textAlign: 'left',
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
                                        textAlign: 'left',
                                        whiteSpace: { xs: 'normal', md: 'nowrap' },
                                    }}
                                >
                                    Entrez vos informations pour créer votre compte
                                </Typography>
                            </Stack>

                            {serverError && (
                                <Alert severity="error" sx={{ mb: '3%', borderRadius: '10px' }}>
                                    {serverError}
                                </Alert>
                            )}

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
                                                    color: focusedField === field.id ? '#1b7548' : '#000',
                                                    fontFamily: 'Quicksand, sans-serif',
                                                    fontSize: 'clamp(8px, 1.25vw, 18px)',
                                                    fontWeight: 700,
                                                    lineHeight: 1.2,
                                                    transition: 'color 0.2s ease',
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
                                                onFocus={() => setFocusedField(field.id)}
                                                onBlur={() => setFocusedField(null)}
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
                                                        transition: 'background-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',

                                                        '&:hover': {
                                                            bgcolor: '#a3b0a6',
                                                            boxShadow: '0 2px 8px rgba(27, 117, 72, 0.25)',
                                                        },
                                                        '&.Mui-focused': {
                                                            bgcolor: '#fff',
                                                            boxShadow: '0 0 0 2px #1b7548, 0 4px 12px rgba(27, 117, 72, 0.35)',
                                                            transform: 'scale(1.01)',
                                                        },
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        border: 0,
                                                    },
                                                    '& .MuiOutlinedInput-input': {
                                                        px: '3%',
                                                        py: 0,
                                                        color: '#000',
                                                        WebkitTextFillColor: '#000',
                                                    },
                                                    '& .MuiOutlinedInput-input::placeholder': {
                                                        color: '#8c8c8c',
                                                        opacity: 1,
                                                        transition: 'opacity 0.2s ease',
                                                    },
                                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input::placeholder': {
                                                        opacity: 0.6,
                                                    },
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>

                                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, mt: '3%' }}>
                                    <SpecularButton
                                        type="submit"
                                        disabled={loading}
                                        size="md"
                                        radius={13}
                                        tint="#1b7548"
                                        tintOpacity={1}
                                        textColor="#8fffc7"
                                        lineColor="#000000"
                                        baseColor="#146f42"
                                        intensity={15}
                                        shineSize={20}
                                        shineFade={40}
                                        thickness={15}
                                        speed={0.8}
                                        followMouse
                                        proximity={250}
                                        autoAnimate
                                        className="register-submit-button"
                                    >
                                        {loading ? 'INSCRIPTION...' : 'SOUMETTRE'}
                                    </SpecularButton>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>

                    <Fade in={showVerify} timeout={400} mountOnEnter unmountOnExit>
                        <Box>
                            <VerifyEmail
                                email={registeredEmail}
                                onVerified={() => navigate('/login')}
                                onBack={() => {
                                    setShowVerify(false)
                                    setShowForm(true)
                                }}
                            />
                        </Box>
                    </Fade>
                </Box>

                <Box
                    component="section"
                    aria-labelledby="platform-title"
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        width: { xs: '100%', md: '47.2%' },
                        px: { xs: '6%', md: '4.7%' },
                        pt: { xs: '8%', md: '6.7%' },
                        pb: { xs: '8%', md: 0 },
                        overflow: 'hidden',
                        bgcolor: '#1b7548',
                        borderRadius: { xs: '0 0 24px 24px', md: '49px 0 0 49px' },
                        boxShadow: { xs: 'none', md: 'inset 26px 0 28px -16px rgba(0,0,0,0.55)' },
                        '&::after': {
                            position: 'absolute',
                            top: '15%',
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
                            marginTop: { xs: 0, md: '-75px' },
                            marginLeft: { xs: 0, md: '5%' },
                        }}
                    >
                        Plateforme de Gestion Du Parc Informatique de la Commune du Golfe 1
                    </Typography>

                    {/* Mobile / tablette : empilement vertical statique, sans animation */}
                    <Stack
                        spacing={2}
                        sx={{
                            display: { xs: 'flex', md: 'none' },
                            position: 'relative',
                            zIndex: 1,
                            mt: '10%',
                            width: '100%',
                        }}
                    >
                        {featureCards.map((feature) => (
                            <FeatureCard key={feature.title} feature={feature} />
                        ))}
                    </Stack>

                    {/* Desktop (md+) : carrousel horizontal avec defilement infini */}
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'block' },
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
                                <FeatureCard key={`${feature.title}-${index}`} feature={feature} />
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}