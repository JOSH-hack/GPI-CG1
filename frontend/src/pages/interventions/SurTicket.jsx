/*

Nom du fichier   : SurTicket.jsx
Objectif         : Page "Intervention sur ticket" - fidele a la maquette Anima.
                    Chargee avec idPanne (clic sur une panne depuis Tickets).
                    Si aucune intervention n'existe encore : carte ticket +
                    selection du type d'intervention + creation sur place.
                    Une fois creee : diagnostic, chat (lien), pieces jointes,
                    resultat, rapport, validation DSI, historique - tout sur
                    la meme page, sans navigation.
Propriétaire     : Josué BEDEL
Date de création : 03/09/2026

*/

import { useEffect, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import WifiIcon from '@mui/icons-material/Wifi'
import BuildIcon from '@mui/icons-material/Build'
import ChatIcon from '@mui/icons-material/ChatBubbleOutline'

import backgroundPic from '../../assets/background/backgroundpic.png'
import { panneApi } from '../../api/panneApi'
import { interventionApi } from '../../api/interventionApi'
import { useAuth } from '../../contexts/AuthContext'
import PieceJointesListe from '../../components/pieceJointe/PieceJointesListe'
import {
    ROLES,
    TYPE_INTERVENTION,
    TYPE_INTERVENTION_LABELS,
    RESULTAT_INTERVENTION,
    RESULTAT_INTERVENTION_LABELS,
    PRIORITE_PANNE_LABELS,
    STATUT_PANNE,
} from '../../utils/constants'

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Link,
    Paper,
    Radio,
    RadioGroup,
    FormControlLabel,
    Stack,
    TextField,
    Typography,
} from '@mui/material'

function numeroTicket(panne) {
    if (!panne) return ''
    const annee = panne.dateSurvenance ? new Date(panne.dateSurvenance).getFullYear() : new Date().getFullYear()
    return `TK-${annee}-${String(panne.idPanne).padStart(4, '0')}`
}

function formaterDate(valeur) {
    if (!valeur) return '—'
    return new Date(valeur).toLocaleDateString('fr-FR')
}

function formaterDateHeure(valeur) {
    if (!valeur) return '—'
    return new Date(valeur).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

function libelleLocalisation(localisation) {
    if (!localisation) return '—'
    return [localisation.annexe, localisation.service, localisation.bureau].filter(Boolean).join(' / ')
}

function statutChip(statut) {
    if (statut === STATUT_PANNE.SIGNALEE) return { label: 'Signalée', bgcolor: '#dc5e60' }
    if (statut === STATUT_PANNE.EN_COURS_TRAITEMENT) return { label: 'En cours', bgcolor: '#e6a817' }
    if (statut === STATUT_PANNE.REPAREE) return { label: 'Réparée', bgcolor: '#1b7548' }
    return { label: 'Réformée', bgcolor: '#9CA3AF' }
}

const cardSx = { p: 2.5, borderRadius: '12px', bgcolor: '#fff', border: '2px solid #146f42' }
const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '8px', fontFamily: 'Quicksand, sans-serif' } }

const CARTES_TYPE = [
    { valeur: TYPE_INTERVENTION.A_DISTANCE, icon: <WifiIcon sx={{ fontSize: 28 }} />, titre: 'À DISTANCE', description: 'Assistance via chat ou prise en main à distance' },
    { valeur: TYPE_INTERVENTION.EN_PRESENTIEL, icon: <BuildIcon sx={{ fontSize: 28 }} />, titre: 'SUR SITE', description: "Déplacement physique pour intervention sur l'équipement" },
]

export default function SurTicket() {
    const { idPanne } = useParams()
    const { user } = useAuth()

    const [panne, setPanne] = useState(null)
    const [intervention, setIntervention] = useState(null)
    const [chargement, setChargement] = useState(true)
    const [erreur, setErreur] = useState('')
    const [erreurAction, setErreurAction] = useState('')

    // Etape "choix du type" (avant creation de l'intervention)
    const [typeChoisi, setTypeChoisi] = useState(null)
    const [creation, setCreation] = useState(false)

    // Champs d'edition une fois l'intervention creee
    const [diagnostic, setDiagnostic] = useState('')
    const [solution, setSolution] = useState('')
    const [piecesRemplacees, setPiecesRemplacees] = useState('')
    const [resultat, setResultat] = useState(RESULTAT_INTERVENTION.REPARATION)
    const [rapport, setRapport] = useState('')

    const [enregistrementDiagnostic, setEnregistrementDiagnostic] = useState(false)
    const [terminaison, setTerminaison] = useState(false)
    const [envoiRapport, setEnvoiRapport] = useState(false)
    const [validation, setValidation] = useState(false)

    async function chargerTout() {
        setChargement(true)
        setErreur('')
        try {
            const reponsePanne = await panneApi.getParId(idPanne)
            setPanne(reponsePanne.data)

            const reponseInterventions = await interventionApi.listerParPanne(idPanne)
            const existante = reponseInterventions.data?.[0] || null
            setIntervention(existante)
            if (existante) {
                setDiagnostic(existante.diagnostic || '')
                setSolution(existante.solution || '')
                setPiecesRemplacees(existante.piecesRemplacees || '')
                setResultat(existante.resultat || RESULTAT_INTERVENTION.REPARATION)
            }
        } catch {
            setErreur('Impossible de charger ce ticket.')
        } finally {
            setChargement(false)
        }
    }

    useEffect(() => {
        chargerTout()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idPanne])

    async function handleCreerIntervention() {
        if (!typeChoisi) return
        setCreation(true)
        setErreurAction('')
        try {
            const response = await interventionApi.creer({
                idPanne: Number(idPanne),
                idTechnicien: user.idUtilisateur,
                typeIntervention: typeChoisi,
            })
            setIntervention(response.data)
        } catch (error) {
            setErreurAction(error.response?.data?.message || "Impossible de créer l'intervention.")
        } finally {
            setCreation(false)
        }
    }

    async function handleEnregistrerDiagnostic() {
        setEnregistrementDiagnostic(true)
        setErreurAction('')
        try {
            await interventionApi.enregistrerDiagnostic(intervention.idIntervention, { diagnostic, solution, piecesRemplacees })
            await chargerTout()
        } catch (error) {
            setErreurAction(error.response?.data?.message || "Impossible d'enregistrer le diagnostic.")
        } finally {
            setEnregistrementDiagnostic(false)
        }
    }

    async function handleTerminerIntervention() {
        setTerminaison(true)
        setErreurAction('')
        try {
            await interventionApi.enregistrerDiagnostic(intervention.idIntervention, { diagnostic, solution, piecesRemplacees })
            await interventionApi.enregistrerResultat(intervention.idIntervention, resultat)
            await chargerTout()
        } catch (error) {
            setErreurAction(error.response?.data?.message || "Impossible de terminer l'intervention.")
        } finally {
            setTerminaison(false)
        }
    }

    async function handleSoumettreRapport() {
        if (!rapport.trim()) {
            setErreurAction('Le rapport ne peut pas être vide.')
            return
        }
        setEnvoiRapport(true)
        setErreurAction('')
        try {
            await interventionApi.redigerRapport(intervention.idIntervention, rapport.trim())
            await chargerTout()
        } catch (error) {
            setErreurAction(error.response?.data?.message || "Impossible d'envoyer le rapport.")
        } finally {
            setEnvoiRapport(false)
        }
    }

    async function handleValider() {
        setValidation(true)
        setErreurAction('')
        try {
            await interventionApi.valider(intervention.idIntervention)
            await chargerTout()
        } catch (error) {
            setErreurAction(error.response?.data?.message || "Impossible de valider cette intervention.")
        } finally {
            setValidation(false)
        }
    }

    if (chargement) {
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!panne) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{erreur || 'Ticket introuvable.'}</Alert>
            </Box>
        )
    }

    const badge = statutChip(panne.statut)
    const estTechnicien = user?.role === ROLES.TECHNICIEN
    const estDsi = user?.role === ROLES.RESPONSABLE_DSI
    const estSonIntervention = estTechnicien && intervention?.technicien?.idUtilisateur === user?.idUtilisateur

    const interventionEnCours = intervention && !intervention.dateResolution
    const resultatEnAttente = intervention && Boolean(intervention.dateResolution) && !intervention.rapport
    const enAttenteValidation = intervention && Boolean(intervention.rapport) && !intervention.dateValidationDsi
    const terminee = intervention && Boolean(intervention.dateValidationDsi)

    const peutModifierDiagnostic = estSonIntervention && interventionEnCours
    const peutRedigerRapport = estSonIntervention && resultatEnAttente
    const peutValider = estDsi && enAttenteValidation

    const historique = intervention
        ? [
            panne.dateSurvenance && { date: panne.dateSurvenance, label: `Ticket créé par ${panne.utilisateurSignaleur?.nom || ''} ${panne.utilisateurSignaleur?.prenom || ''}` },
            intervention.dateIntervention && { date: intervention.dateIntervention, label: `Assigné au technicien ${intervention.technicien?.nom || ''} ${intervention.technicien?.prenom || ''} — ${TYPE_INTERVENTION_LABELS[intervention.typeIntervention]}` },
            intervention.dateResolution && { date: intervention.dateResolution, label: `Intervention terminée — ${RESULTAT_INTERVENTION_LABELS[intervention.resultat] || ''}` },
            intervention.dateRapport && { date: intervention.dateRapport, label: 'Rapport soumis' },
            intervention.dateValidationDsi && { date: intervention.dateValidationDsi, label: `Validé par ${intervention.validateurDsi?.nom || ''} ${intervention.validateurDsi?.prenom || ''}` },
        ].filter(Boolean)
        : [panne.dateSurvenance && { date: panne.dateSurvenance, label: `Ticket créé par ${panne.utilisateurSignaleur?.nom || ''} ${panne.utilisateurSignaleur?.prenom || ''}` }].filter(Boolean)

    return (
        <Box
            component="section"
            sx={{
                width: '100%',
                minHeight: '100%',
                backgroundImage: `linear-gradient(rgba(204, 204, 204, 0.6), rgba(201, 201, 201, 0.8)), url(${backgroundPic})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                px: { xs: 1.5, sm: 3 },
                pt: 2.5,
                pb: 3,
                fontFamily: 'Quicksand, sans-serif',
                boxSizing: 'border-box',
                flex: 1,
            }}
        >
            <Stack spacing={2.5} sx={{ maxWidth: 900 }}>
                {erreurAction && (
                    <Alert severity="error" onClose={() => setErreurAction('')}>
                        {erreurAction}
                    </Alert>
                )}

                {/* Carte ticket */}
                <Paper elevation={0} sx={cardSx}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" spacing={1}>
                        <Typography sx={{ color: '#0c5d7d', fontSize: 20, fontWeight: 700 }}>
                            Ticket {numeroTicket(panne)}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Chip label={badge.label} size="small" sx={{ bgcolor: badge.bgcolor, color: '#fff', fontWeight: 700, fontFamily: 'Quicksand, sans-serif' }} />
                            {intervention && (
                                <Chip label={TYPE_INTERVENTION_LABELS[intervention.typeIntervention]} size="small" sx={{ bgcolor: '#0c5d7d', color: '#fff', fontWeight: 700, fontFamily: 'Quicksand, sans-serif' }} />
                            )}
                        </Stack>
                    </Stack>
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography sx={{ fontSize: 14, color: '#0c5d7d' }}>
                            <strong>Équipement :</strong> {panne.equipement?.codeInventaire} — {panne.equipement?.marque} {panne.equipement?.modele}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: '#0c5d7d' }}>
                            <strong>Problème :</strong> {panne.description}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: '#0c5d7d' }}>
                            <strong>Priorité :</strong> {PRIORITE_PANNE_LABELS[panne.priorite]}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: '#0c5d7d' }}>
                            <strong>Signalé par :</strong> {panne.utilisateurSignaleur?.nom} {panne.utilisateurSignaleur?.prenom}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: '#0c5d7d' }}>
                            <strong>Date :</strong> {formaterDate(panne.dateSurvenance)}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: '#0c5d7d' }}>
                            <strong>Localisation :</strong> {libelleLocalisation(panne.equipement?.localisation)}
                        </Typography>
                        {intervention && (
                            <Typography sx={{ fontSize: 14, color: '#0c5d7d' }}>
                                <strong>Technicien :</strong> {intervention.technicien?.nom} {intervention.technicien?.prenom}
                            </Typography>
                        )}
                    </Stack>
                </Paper>

                {/* Choix du type - seulement si aucune intervention n'existe encore */}
                {!intervention && (
                    <Paper elevation={0} sx={cardSx}>
                        <Typography sx={{ color: '#0c5d7d', fontSize: 16, fontWeight: 700, mb: 1.5 }}>
                            Choisissez le type d'intervention
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            {CARTES_TYPE.map((carte) => {
                                const isSelected = typeChoisi === carte.valeur
                                return (
                                    <Box
                                        key={carte.valeur}
                                        onClick={() => setTypeChoisi(carte.valeur)}
                                        sx={{
                                            flex: 1,
                                            p: 2,
                                            borderRadius: '10px',
                                            border: '2px solid',
                                            borderColor: isSelected ? '#146f42' : 'rgba(13, 93, 125, 0.2)',
                                            bgcolor: isSelected ? 'rgba(20, 111, 66, 0.06)' : '#fff',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Box sx={{ color: isSelected ? '#146f42' : '#0c5d7d', mb: 1 }}>{carte.icon}</Box>
                                        <Typography sx={{ fontWeight: 700, color: '#0c5d7d', fontSize: 14 }}>{carte.titre}</Typography>
                                        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>{carte.description}</Typography>
                                    </Box>
                                )
                            })}
                        </Stack>
                        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                disabled={!typeChoisi || creation}
                                onClick={handleCreerIntervention}
                                sx={{ bgcolor: '#0c5d7d', textTransform: 'none', fontWeight: 700, fontFamily: 'Quicksand, sans-serif', px: 3, '&:hover': { bgcolor: '#094a63' } }}
                            >
                                {creation ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Suivant'}
                            </Button>
                        </Stack>
                    </Paper>
                )}

                {/* Le reste ne s'affiche qu'une fois l'intervention creee */}
                {intervention && (
                    <>
                        {intervention.typeIntervention === TYPE_INTERVENTION.A_DISTANCE && (
                            <Paper elevation={0} sx={cardSx}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <ChatIcon sx={{ color: '#0c5d7d' }} />
                                        <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 16 }}>
                                            Chat — intervention à distance
                                        </Typography>
                                    </Stack>
                                    <Link component={RouterLink} to={`/assistance/messages/${intervention.idIntervention}`} sx={{ color: '#146f42', fontWeight: 700, fontSize: 13 }}>
                                        Ouvrir le chat →
                                    </Link>
                                </Stack>
                            </Paper>
                        )}

                        <Paper elevation={0} sx={cardSx}>
                            <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 16, mb: 1.5 }}>Diagnostic</Typography>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                placeholder="Décrivez le diagnostic établi..."
                                value={diagnostic}
                                onChange={(event) => setDiagnostic(event.target.value)}
                                disabled={!peutModifierDiagnostic}
                                sx={fieldSx}
                            />
                        </Paper>

                        <Paper elevation={0} sx={cardSx}>
                            <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 16, mb: 1.5 }}>
                                Solution / Pièces remplacées
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                placeholder="Décrivez la solution appliquée..."
                                value={solution}
                                onChange={(event) => setSolution(event.target.value)}
                                disabled={!peutModifierDiagnostic}
                                sx={{ ...fieldSx, mb: 1.5 }}
                            />
                            <TextField
                                fullWidth
                                size="small"
                                label="Pièces remplacées (optionnel)"
                                value={piecesRemplacees}
                                onChange={(event) => setPiecesRemplacees(event.target.value)}
                                disabled={!peutModifierDiagnostic}
                                sx={fieldSx}
                            />
                            {peutModifierDiagnostic && (
                                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
                                    <Button
                                        onClick={handleEnregistrerDiagnostic}
                                        disabled={enregistrementDiagnostic}
                                        sx={{ bgcolor: '#0c5d7d', color: '#fff', textTransform: 'none', fontWeight: 700, fontFamily: 'Quicksand, sans-serif', px: 2.5, '&:hover': { bgcolor: '#094a63' } }}
                                    >
                                        {enregistrementDiagnostic ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Enregistrer'}
                                    </Button>
                                </Stack>
                            )}
                        </Paper>

                        {/* Pieces jointes de la panne - upload par l'agent/technicien, consultation ici */}
                        <Paper elevation={0} sx={cardSx}>
                            <PieceJointesListe idPanne={panne.idPanne} />
                        </Paper>

                        {(interventionEnCours || intervention.resultat) && (
                            <Paper elevation={0} sx={cardSx}>
                                <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 16, mb: 1 }}>
                                    Résultat de l'intervention
                                </Typography>
                                <RadioGroup value={resultat} onChange={(event) => setResultat(event.target.value)}>
                                    <FormControlLabel
                                        value={RESULTAT_INTERVENTION.REPARATION}
                                        control={<Radio disabled={!peutModifierDiagnostic} />}
                                        label="Réparation — l'équipement est entièrement fonctionnel"
                                    />
                                    <FormControlLabel
                                        value={RESULTAT_INTERVENTION.DEPANNAGE}
                                        control={<Radio disabled={!peutModifierDiagnostic} />}
                                        label="Dépannage — solution temporaire, suivi nécessaire"
                                    />
                                </RadioGroup>
                                {peutModifierDiagnostic && (
                                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
                                        <Button
                                            onClick={handleTerminerIntervention}
                                            disabled={terminaison}
                                            sx={{ bgcolor: '#dc5e60', color: '#fff', textTransform: 'none', fontWeight: 700, fontFamily: 'Quicksand, sans-serif', px: 3, '&:hover': { bgcolor: '#c95355' } }}
                                        >
                                            {terminaison ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : "Terminer l'intervention"}
                                        </Button>
                                    </Stack>
                                )}
                            </Paper>
                        )}

                        {(peutRedigerRapport || intervention.rapport) && (
                            <Paper elevation={0} sx={cardSx}>
                                <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 16, mb: 1.5 }}>
                                    Rapport d'intervention
                                </Typography>
                                {peutRedigerRapport ? (
                                    <>
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={4}
                                            placeholder="Rédigez le rapport final de cette intervention..."
                                            value={rapport}
                                            onChange={(event) => setRapport(event.target.value)}
                                            sx={fieldSx}
                                        />
                                        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
                                            <Button
                                                onClick={handleSoumettreRapport}
                                                disabled={envoiRapport}
                                                variant="contained"
                                                sx={{ bgcolor: '#146f42', textTransform: 'none', fontWeight: 700, fontFamily: 'Quicksand, sans-serif', px: 3, '&:hover': { bgcolor: '#0f5a35' } }}
                                            >
                                                {envoiRapport ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Soumettre le rapport'}
                                            </Button>
                                        </Stack>
                                    </>
                                ) : (
                                    <Typography sx={{ fontSize: 14, color: '#0c5d7d', whiteSpace: 'pre-wrap' }}>{intervention.rapport}</Typography>
                                )}
                            </Paper>
                        )}

                        {peutValider && (
                            <Paper elevation={0} sx={cardSx}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={1}>
                                    <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 16 }}>
                                        Ce rapport est en attente de votre validation
                                    </Typography>
                                    <Button
                                        onClick={handleValider}
                                        disabled={validation}
                                        variant="contained"
                                        sx={{ bgcolor: '#146f42', textTransform: 'none', fontWeight: 700, fontFamily: 'Quicksand, sans-serif', px: 3, '&:hover': { bgcolor: '#0f5a35' } }}
                                    >
                                        {validation ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Valider'}
                                    </Button>
                                </Stack>
                            </Paper>
                        )}

                        {terminee && (
                            <Alert severity="success">
                                Cette intervention a été validée le {formaterDateHeure(intervention.dateValidationDsi)} par{' '}
                                {intervention.validateurDsi?.nom} {intervention.validateurDsi?.prenom}.
                            </Alert>
                        )}
                    </>
                )}

                {/* Historique - toujours visible, meme avant creation de l'intervention */}
                <Paper elevation={0} sx={cardSx}>
                    <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 16, mb: 1.5 }}>Historique du ticket</Typography>
                    <Stack spacing={1.5}>
                        {historique.map((evenement, index) => (
                            <Stack key={index} direction="row" spacing={1.5} alignItems="flex-start">
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#146f42', mt: 0.6, flexShrink: 0 }} />
                                <Box>
                                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{formaterDateHeure(evenement.date)}</Typography>
                                    <Typography sx={{ fontSize: 14, color: '#0c5d7d' }}>{evenement.label}</Typography>
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    )
}