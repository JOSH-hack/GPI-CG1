/*

Nom du fichier   : VerifyEmail.jsx
Objectif         : Etape 2 de l'inscription - saisie du code de verification recu par
                    email (6 chiffres, valable 15 minutes cote backend), avec compte a
                    rebours avant expiration et renvoi de code. S'affiche a la place du
                    formulaire de Register.jsx via une transition en fondu (voir le Fade
                    controle par le parent), sur le meme panneau visuel.
Propriétaire     : Josué BEDEL
Date de création : 01/09/2026

*/

import { useEffect, useState } from 'react'
import {
    Alert,
    Box,
    Link,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import SpecularButton from '../common/SpecularButton'
import { authApi } from '../../api/authApi'

// Duree de validite du code cote backend (UtilisateurService.renvoyerCodeVerification
// et l'inscription initiale posent toutes les deux dateExpirationCode = +15 minutes).
const DUREE_CODE_SECONDES = 15 * 60

function formaterTempsRestant(secondes) {
    const minutes = Math.floor(secondes / 60)
    const reste = secondes % 60
    return `${minutes}:${String(reste).padStart(2, '0')}`
}

export default function VerifyEmail({ email, onVerified, onBack }) {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [resendLoading, setResendLoading] = useState(false)
    const [resendMessage, setResendMessage] = useState('')

    const [secondesRestantes, setSecondesRestantes] = useState(DUREE_CODE_SECONDES)
    const codeExpire = secondesRestantes <= 0

    // Compte a rebours local, purement indicatif pour l'utilisateur : la source de
    // verite reste le backend (dateExpirationCode), qui refusera de toute facon un
    // code perime meme si ce timer a derive.
    useEffect(() => {
        if (codeExpire) return undefined

        const intervalle = setInterval(() => {
            setSecondesRestantes((valeur) => Math.max(0, valeur - 1))
        }, 1000)

        return () => clearInterval(intervalle)
    }, [codeExpire])

    function handleChangeCode(event) {
        // Uniquement des chiffres, 6 max - le backend genere des codes a 6 chiffres.
        const valeur = event.target.value.replace(/\D/g, '').slice(0, 6)
        setCode(valeur)
        if (error) setError('')
    }

    async function handleSubmit(event) {
        event.preventDefault()
        if (codeExpire) return

        setError('')
        setLoading(true)
        try {
            await authApi.verifyEmail(email, code)
            onVerified()
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Une erreur est survenue, veuillez réessayer'
            )
        } finally {
            setLoading(false)
        }
    }

    async function handleResend() {
        setError('')
        setResendMessage('')
        setResendLoading(true)
        try {
            await authApi.resendCode(email)
            setSecondesRestantes(DUREE_CODE_SECONDES)
            setCode('')
            setResendMessage('Un nouveau code vous a été envoyé par email.')
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Impossible de renvoyer le code pour le moment, veuillez réessayer'
            )
        } finally {
            setResendLoading(false)
        }
    }

    return (
        <Box>
            <Stack alignItems="left" spacing={0} sx={{ width: '100%', mb: '4.2%' }}>
                <Typography
                    id="verify-email-title"
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
                    Vérifiez votre email
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
                    }}
                >
                    Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
                </Typography>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: '3%', borderRadius: '10px' }}>
                    {error}
                </Alert>
            )}
            {resendMessage && (
                <Alert severity="success" sx={{ mb: '3%', borderRadius: '10px' }}>
                    {resendMessage}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', pt: '1%' }}>
                <Typography
                    component="label"
                    htmlFor="verification-code"
                    sx={{
                        color: '#000',
                        fontFamily: 'Quicksand, sans-serif',
                        fontSize: 'clamp(8px, 1.25vw, 18px)',
                        fontWeight: 700,
                        lineHeight: 1.2,
                        mb: '1.2%',
                    }}
                >
                    Code de vérification
                </Typography>
                <TextField
                    fullWidth
                    id="verification-code"
                    name="code"
                    value={code}
                    onChange={handleChangeCode}
                    placeholder="123456"
                    inputMode="numeric"
                    variant="outlined"
                    disabled={codeExpire}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            height: 'clamp(29px, 4.8vw, 49px)',
                            borderRadius: '13px',
                            bgcolor: '#b2bdb4',
                            color: '#000',
                            fontFamily: 'Quicksand, sans-serif',
                            fontSize: 'clamp(14px, 2.2vw, 26px)',
                            fontWeight: 700,
                            letterSpacing: '0.3em',
                            '&.Mui-focused': {
                                bgcolor: '#fff',
                                boxShadow: '0 0 0 2px #1b7548, 0 4px 12px rgba(27, 117, 72, 0.35)',
                            },
                        },
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiOutlinedInput-input': { px: '3%', py: 0, textAlign: 'center' },
                    }}
                />

                <Typography
                    sx={{
                        mt: '2%',
                        fontFamily: 'Quicksand, sans-serif',
                        fontSize: 'clamp(7px, 1vw, 14px)',
                        color: codeExpire ? '#c62828' : '#4e4b4b',
                        fontWeight: 600,
                    }}
                >
                    {codeExpire
                        ? 'Ce code a expiré.'
                        : `Ce code expire dans ${formaterTempsRestant(secondesRestantes)}`}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, mt: '5%' }}>
                    <SpecularButton
                        type="submit"
                        disabled={loading || codeExpire || code.length !== 6}
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
                        className="verify-email-submit-button"
                    >
                        {loading ? 'VÉRIFICATION...' : 'VÉRIFIER'}
                    </SpecularButton>
                </Box>

                <Typography
                    sx={{
                        mt: '4%',
                        textAlign: { xs: 'center', md: 'right' },
                        fontFamily: 'Quicksand, sans-serif',
                        fontSize: 'clamp(8px, 1.1vw, 15px)',
                        color: '#4e4b4b',
                    }}
                >
                    Vous n&apos;avez rien reçu ?{' '}
                    <Link
                        component="button"
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading}
                        sx={{ color: '#1b7548', fontWeight: 700, textDecoration: 'none' }}
                    >
                        {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
                    </Link>
                    {onBack && (
                        <>
                            {' · '}
                            <Link
                                component="button"
                                type="button"
                                onClick={onBack}
                                sx={{ color: '#1b7548', fontWeight: 700, textDecoration: 'none' }}
                            >
                                Mauvaise adresse ?
                            </Link>
                        </>
                    )}
                </Typography>
            </Box>
        </Box>
    )
}