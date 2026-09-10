/*

Nom du fichier   : BasesDeDonnees.jsx
Objectif         : Page Outils - Base de donnees, fidele a la maquette
                    Outils-bases_de_donnes.pdf (taille base, statut, sauvegardes
                    reelles via pg_dump, restauration, logs systeme reels avec
                    filtre/pagination)
Propriétaire     : Josué BEDEL
Date de création : 10/09/2026

*/

import { useEffect, useState } from 'react'
import BackupOutlined from '@mui/icons-material/BackupOutlined'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined'
import RestoreOutlined from '@mui/icons-material/RestoreOutlined'
import StorageOutlined from '@mui/icons-material/StorageOutlined'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined'
import CheckIcon from '@mui/icons-material/Check'

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'

import { outilsApi } from '../../api/outilsApi'
import backgroundPic from '../../assets/background/backgroundpic.png'

const NIVEAUX = ['Tous', 'INFO', 'AVERTISSEMENT', 'ERREUR']

const NIVEAU_STYLES = {
    INFO: { bgcolor: '#bee3f8', color: '#2a4365' },
    ERREUR: { bgcolor: '#fed7d7', color: '#9b2c2c' },
    AVERTISSEMENT: { bgcolor: '#fefcbf', color: '#975a16' },
}

const STATUT_STYLES = {
    REUSSIE: { bgcolor: '#c6f6d5', color: '#22543d', label: 'Réussie' },
    ECHOUEE: { bgcolor: '#fed7d7', color: '#9b2c2c', label: 'Échouée' },
    EN_COURS: { bgcolor: '#e2e8f0', color: '#4a5568', label: 'En cours' },
}

function formaterOctets(octets) {
    if (octets == null) return '—'
    const mo = octets / (1024 * 1024)
    return `${mo.toFixed(0)} Mo`
}

function formaterDate(valeur) {
    if (!valeur) return '—'
    return new Date(valeur).toLocaleDateString('fr-FR')
}

function formaterHeure(valeur) {
    if (!valeur) return '—'
    return new Date(valeur).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formaterDateHeure(valeur) {
    if (!valeur) return '—'
    return new Date(valeur).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

const cardSx = { border: '2px solid #146f42', borderRadius: '7px' }

export default function BasesDeDonnees() {
    const [taille, setTaille] = useState(null)
    const [sauvegardes, setSauvegardes] = useState([])
    const [chargement, setChargement] = useState(true)
    const [erreur, setErreur] = useState('')

    const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false)
    const [telechargementId, setTelechargementId] = useState(null)

    const [niveau, setNiveau] = useState('Tous')
    const [logs, setLogs] = useState({ content: [], totalElements: 0 })
    const [pageLog, setPageLog] = useState(0)
    const [chargementLogs, setChargementLogs] = useState(true)

    const [confirmationOuverte, setConfirmationOuverte] = useState(false)
    const [sauvegardeAConfirmer, setSauvegardeAConfirmer] = useState(null)
    const [restaurationEnCours, setRestaurationEnCours] = useState(false)

    async function chargerSauvegardes() {
        try {
            const [resTaille, resSauvegardes] = await Promise.all([
                outilsApi.tailleBase(),
                outilsApi.listerSauvegardes(),
            ])
            setTaille(resTaille.data.tailleOctets)
            setSauvegardes(resSauvegardes.data)
        } catch {
            setErreur('Impossible de charger les informations de la base.')
        } finally {
            setChargement(false)
        }
    }

    async function chargerLogs() {
        setChargementLogs(true)
        try {
            const res = await outilsApi.listerLogs(niveau, pageLog, 10)
            setLogs(res.data)
        } catch {
            setErreur('Impossible de charger les logs système.')
        } finally {
            setChargementLogs(false)
        }
    }

    useEffect(() => {
        chargerSauvegardes()
    }, [])

    useEffect(() => {
        chargerLogs()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [niveau, pageLog])

    async function handleSauvegarderMaintenant() {
        setSauvegardeEnCours(true)
        setErreur('')
        try {
            await outilsApi.effectuerSauvegarde()
            await chargerSauvegardes()
        } catch (err) {
            setErreur(err.response?.data?.message || 'La sauvegarde a échoué.')
        } finally {
            setSauvegardeEnCours(false)
        }
    }

    async function handleTelecharger(sauvegarde) {
        setTelechargementId(sauvegarde.idSauvegarde)
        try {
            await outilsApi.telechargerSauvegarde(sauvegarde.idSauvegarde, `sauvegarde-${sauvegarde.idSauvegarde}.sql`)
        } catch {
            setErreur('Impossible de télécharger cette sauvegarde.')
        } finally {
            setTelechargementId(null)
        }
    }

    async function handleConfirmerRestauration() {
        if (!sauvegardeAConfirmer) return
        setRestaurationEnCours(true)
        setErreur('')
        try {
            await outilsApi.restaurerSauvegarde(sauvegardeAConfirmer.idSauvegarde)
            setConfirmationOuverte(false)
            await chargerSauvegardes()
        } catch (err) {
            setErreur(err.response?.data?.message || 'La restauration a échoué.')
        } finally {
            setRestaurationEnCours(false)
        }
    }

    const derniereSauvegarde = sauvegardes.find((s) => s.statut === 'REUSSIE')
    const sauvegardesReussies = sauvegardes.filter((s) => s.statut === 'REUSSIE')

    const totalPages = Math.max(1, Math.ceil(logs.totalElements / 10))

    if (chargement) {
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box
            component="section"
            sx={{
                position: 'relative',
                p: { xs: 2, sm: 3 },
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'Quicksand, sans-serif',
                flex: 1,
                minHeight: '100%',
            }}
        >
            <Box
                aria-hidden="true"
                sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    backgroundImage: `url(${backgroundPic})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.1,
                }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Stack spacing={2.25}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <Box sx={{ display: 'grid', placeItems: 'center', width: 28, height: 28, border: '1px solid #e2e8f0', borderRadius: '8px',  backgroundImage: ` linear-gradient(
                                                                     rgba(204, 204, 204, 0.73),
                                                                     rgba(214, 200, 200, 0.8)
                                                               ),
                                                               url(${backgroundPic})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat', color: '#0c5d7d' }}>
                            <StorageOutlined sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 42,fontFamily: 'Iceland', fontWeight: 700, color: '#1f2937' }}>Base de données</Typography>
                            <Typography sx={{ fontSize: 20, color: '#494a4b', fontWeight: 500 }}>
                                Supervision, sauvegardes et journaux système
                            </Typography>
                        </Box>
                    </Stack>

                    {erreur && (
                        <Alert severity="error" onClose={() => setErreur('')}>
                            {erreur}
                        </Alert>
                    )}

                    {/* Cartes de synthese */}
                    <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <Card variant="outlined" sx={cardSx}>
                                <CardContent>
                                    <Stack spacing={0.75}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Box sx={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', bgcolor: '#4299e1', color: '#fff' }}>
                                                <StorageOutlined sx={{ fontSize: 16 }} />
                                            </Box>
                                        </Box>
                                        <Typography sx={{ fontSize: 26, fontWeight: 700 }}>{formaterOctets(taille)}</Typography>
                                        <Typography sx={{ fontSize: 16, color: '#718096', fontWeight: 500 }}>Taille totale de la base</Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <Card variant="outlined" sx={cardSx}>
                                <CardContent>
                                    <Stack spacing={0.75}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Box sx={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', bgcolor: '#0c5d7d', color: '#fff' }}>
                                                <AccessTimeIcon sx={{ fontSize: 18 }} />
                                            </Box>
                                        </Box>
                                        <Typography sx={{ fontSize: 26, fontWeight: 700 }}>
                                            {derniereSauvegarde ? `${formaterDate(derniereSauvegarde.dateSauvegarde)} ${formaterHeure(derniereSauvegarde.dateSauvegarde)}` : 'Aucune'}
                                        </Typography>
                                        <Typography sx={{ fontSize: 16, color: '#718096', fontWeight: 500 }}>Dernière sauvegarde</Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <Card variant="outlined" sx={cardSx}>
                                <CardContent>
                                    <Stack spacing={0.75}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Box sx={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', bgcolor: '#ed8936', color: '#fff' }}>
                                                <BackupOutlined sx={{ fontSize: 18 }} />
                                            </Box>
                                        </Box>
                                        <Typography sx={{ fontSize: 26, fontWeight: 700 }}>02:00</Typography>
                                        <Typography sx={{ fontSize: 16, color: '#718096', fontWeight: 500 }}>
                                            Prochaine sauvegarde planifiée (quotidienne)
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <Card variant="outlined" sx={cardSx}>
                                <CardContent>
                                    <Stack spacing={0.75}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Box sx={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', bgcolor: '#48bb78', color: '#fff' }}>
                                                <CheckIcon sx={{ fontSize: 18 }} />
                                            </Box>
                                        </Box>
                                        <Typography sx={{ fontSize: 26, fontWeight: 700, color: '#48bb78' }}>Opérationnelle</Typography>
                                        <Typography sx={{ fontSize: 16, color: '#718096', fontWeight: 500 }}>Statut de la base</Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Sauvegardes */}
                    <Stack spacing={1}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>Sauvegardes</Typography>
                            <Button
                                variant="contained"
                                startIcon={sauvegardeEnCours ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <BackupOutlined sx={{ fontSize: 18 }} />}
                                onClick={handleSauvegarderMaintenant}
                                disabled={sauvegardeEnCours}
                                sx={{ bgcolor: '#dc5e60', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#c94e50' } }}
                            >
                                {sauvegardeEnCours ? 'Sauvegarde en cours...' : 'Effectuer une sauvegarde maintenant'}
                            </Button>
                        </Stack>

                        <TableContainer sx={{ border: '2px solid #146f42', borderRadius: '6px' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f7fafc' }}>
                                        {['Date', 'Heure', 'Taille', 'Statut', 'Action'].map((label) => (
                                            <TableCell key={label} align={label === 'Action' ? 'right' : 'left'} sx={{ fontWeight: 600, fontSize: 16, color: '#1a1a1b' }}>
                                                {label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sauvegardes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                Aucune sauvegarde pour l&apos;instant.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sauvegardes.map((sauvegarde, index) => {
                                            const style = STATUT_STYLES[sauvegarde.statut] || STATUT_STYLES.EN_COURS
                                            return (
                                                <TableRow key={sauvegarde.idSauvegarde} sx={{ bgcolor: index % 2 === 0 ? '#fff' : '#fafbfc' }}>
                                                    <TableCell sx={{ fontSize: 16, color: '#000000', fontWeight: 900 }}>{formaterDate(sauvegarde.dateSauvegarde)}</TableCell>
                                                    <TableCell sx={{ fontSize: 16, color: '#000000', fontWeight: 900 }}>{formaterHeure(sauvegarde.dateSauvegarde)}</TableCell>
                                                    <TableCell sx={{ fontSize: 16, color: '#000000', fontWeight: 900 }}>{formaterOctets(sauvegarde.tailleOctets)}</TableCell>
                                                    <TableCell>
                                                        <Chip label={style.label} size="small" sx={{ height: 20, bgcolor: style.bgcolor, color: style.color, fontWeight: 700, fontSize: 11 }} />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            size="small"
                                                            disabled={sauvegarde.statut !== 'REUSSIE' || telechargementId === sauvegarde.idSauvegarde}
                                                            onClick={() => handleTelecharger(sauvegarde)}
                                                            sx={{ color: '#718096' }}
                                                        >
                                                            {telechargementId === sauvegarde.idSauvegarde ? (
                                                                <CircularProgress size={16} />
                                                            ) : (
                                                                <FileDownloadOutlined sx={{ fontSize: 16 }} />
                                                            )}
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>

                    {/* Logs systeme */}
                    <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>Logs système</Typography>
                            <FormControl size="small">
                                <Select
                                    value={niveau}
                                    onChange={(e) => { setNiveau(e.target.value); setPageLog(0) }}
                                    sx={{ minWidth: 130, fontSize: 18, fontWeight: 900 }}
                                >
                                    {NIVEAUX.map((n) => (
                                        <MenuItem key={n} value={n}>
                                            Niveau : {n === 'AVERTISSEMENT' ? 'Avertissement' : n === 'ERREUR' ? 'Erreur' : n === 'INFO' ? 'Info' : 'Tous'}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        <TableContainer sx={{ border: '2px solid #146f42', borderRadius: '6px', overflowX: 'auto' }}>
                            <Table size="small" sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f7fafc' }}>
                                        {['Date', 'Niveau', 'Message', 'Utilisateur'].map((label) => (
                                            <TableCell key={label} sx={{ fontWeight: 600, fontSize: 18, color: '#4a5568' }}>
                                                {label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {chargementLogs ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                <CircularProgress size={20} />
                                            </TableCell>
                                        </TableRow>
                                    ) : logs.content.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                Aucun log.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.content.map((log, index) => (
                                            <TableRow key={log.idLog} sx={{ bgcolor: index % 2 === 0 ? '#fff' : '#fafbfc' }}>
                                                <TableCell sx={{ fontSize: 18, color: '#1d1c1c', fontWeight: 900 }}>{formaterDateHeure(log.dateLog)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={log.niveau === 'AVERTISSEMENT' ? 'Avertissement' : log.niveau === 'ERREUR' ? 'Erreur' : 'Info'}
                                                        size="small"
                                                        sx={{ height: 20, borderRadius: '3px', ...(NIVEAU_STYLES[log.niveau] || {}), fontWeight: 700, fontSize: 16 }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 18, color: '#1d1c1c', fontWeight: 900 }}>{log.message}</TableCell>
                                                <TableCell sx={{ fontSize: 18, color: '#1d1c1c', fontWeight: 900 }}>{log.utilisateur || '—'}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontSize: 16, color: '#171718' }}>Lignes par page : 10</Typography>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                                <Typography sx={{ fontSize: 16, color: '#718096' }}>
                                    {logs.totalElements === 0 ? '0 sur 0' : `${pageLog * 10 + 1}-${Math.min((pageLog + 1) * 10, logs.totalElements)} sur ${logs.totalElements}`}
                                </Typography>
                                <IconButton size="small" disabled={pageLog === 0} onClick={() => setPageLog((p) => p - 1)} sx={{ border: '1px solid #101113', borderRadius: '5px' }}>
                                    <ChevronLeft sx={{ fontSize: 16, fontWeight: 900 }} />
                                </IconButton>
                                <IconButton size="small" disabled={pageLog + 1 >= totalPages} onClick={() => setPageLog((p) => p + 1)} sx={{ border: '1px solid #101113', borderRadius: '5px' }}>
                                    <ChevronRight sx={{ fontSize: 16, fontWeight: 900 }} />
                                </IconButton>
                            </Stack>
                        </Stack>
                    </Stack>

                    {/* Restauration */}
                    <Alert
                        icon={<WarningAmberOutlined fontSize="inherit" />}
                        severity="error"
                        sx={{ border: '2px solid #ff8486', borderRadius: '6px', bgcolor: '#fff5f5', color: '#9b2c2c' }}
                    >
                        <Stack spacing={1}>
                            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                                Cette action remplace les données actuelles par celles de la sauvegarde sélectionnée et ne peut pas être annulée.
                            </Typography>
                            <FormControl size="small" sx={{ maxWidth: 320 }}>
                                <Select
                                    displayEmpty
                                    value={sauvegardeAConfirmer?.idSauvegarde || ''}
                                    onChange={(e) => {
                                        const s = sauvegardesReussies.find((x) => x.idSauvegarde === e.target.value)
                                        setSauvegardeAConfirmer(s || null)
                                    }}
                                >
                                    <MenuItem value="">Choisir une sauvegarde à restaurer...</MenuItem>
                                    {sauvegardesReussies.map((s) => (
                                        <MenuItem key={s.idSauvegarde} value={s.idSauvegarde}>
                                            {formaterDate(s.dateSauvegarde)} {formaterHeure(s.dateSauvegarde)} — {formaterOctets(s.tailleOctets)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                startIcon={<RestoreOutlined sx={{ fontSize: 18 }} />}
                                onClick={() => setConfirmationOuverte(true)}
                                disabled={!sauvegardeAConfirmer}
                                sx={{ alignSelf: 'flex-start', border: '1.5px solid #e53e3e', color: '#e53e3e', textTransform: 'none', fontWeight: 600 }}
                            >
                                Restaurer une sauvegarde
                            </Button>
                        </Stack>
                    </Alert>
                </Stack>
            </Box>

            <Dialog open={confirmationOuverte} onClose={() => setConfirmationOuverte(false)}>
                <DialogTitle sx={{ color: '#9b2c2c', fontWeight: 700 }}>Confirmer la restauration</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: 16, color: '#141414' }}>
                        Toutes les données actuelles seront remplacées par celles de la sauvegarde du{' '}
                        {sauvegardeAConfirmer && `${formaterDate(sauvegardeAConfirmer.dateSauvegarde)} ${formaterHeure(sauvegardeAConfirmer.dateSauvegarde)}`}.
                        Cette action est <strong>irréversible</strong>.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmationOuverte(false)} disabled={restaurationEnCours}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirmerRestauration}
                        disabled={restaurationEnCours}
                        variant="contained"
                        color="error"
                    >
                        {restaurationEnCours ? 'Restauration en cours...' : 'Confirmer et restaurer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}