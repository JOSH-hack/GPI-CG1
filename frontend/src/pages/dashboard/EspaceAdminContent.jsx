/*

Nom du fichier   : EspaceAdminContent.jsx
Objectif         : Tableau de bord Parc Informatique pour ADMIN_INFO,
                    ADMIN_SYSTEME et RESPONSABLE_DSI - fidele a la maquette
                    tableau-de-bord-parc (cartes de synthese, 3 donuts,
                    derniers equipements ajoutes)
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { keyframes } from '@emotion/react'
import AddIcon from '@mui/icons-material/Add'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import DesktopWindowsOutlined from '@mui/icons-material/DesktopWindowsOutlined'
import LanOutlined from '@mui/icons-material/LanOutlined'
import MemoryOutlined from '@mui/icons-material/MemoryOutlined'
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined'
import DeleteOutline from '@mui/icons-material/DeleteOutline'

import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material'

import backgroundPic from '../../assets/background/backgroundpic.png'

import { equipementApi } from '../../api/equipementApi'
import { panneApi } from '../../api/panneApi'
import {
    STATUT_EQUIPEMENT,
    STATUT_EQUIPEMENT_LABELS,
    STATUT_PANNE,
    PRIORITE_PANNE,
    PRIORITE_PANNE_LABELS,
    TYPE_CATEGORIE,
} from '../../utils/constants'
import StatusChip from '../../components/common/StatusChip'

function formaterDate(valeur) {
    if (!valeur) return '—'
    return new Date(valeur).toLocaleDateString('fr-FR')
}

function libelleLocalisation(loc) {
    if (!loc) return '—'
    return [loc.annexe, loc.service, loc.bureau].filter(Boolean).join(' / ')
}

const apparition = keyframes`
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1); }
`

function SummaryCard({ label, valeur, backgroundColor, iconColor, Icon }) {
    return (
        <Card variant="outlined" sx={{ height: '100%', minHeight: 79, bgcolor: backgroundColor, borderColor: '#e5e7eb', borderRadius: 0.5 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack spacing={0.5}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ fontSize: 32, lineHeight: 1, fontWeight: 700, color: '#1f2937', fontFamily: 'Quicksand, sans-serif' }}>
                            {valeur}
                        </Typography>
                        <Box sx={{ color: iconColor, display: 'flex' }}>
                            <Icon fontSize="small" />
                        </Box>
                    </Stack>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#6b7280', fontFamily: 'Quicksand, sans-serif' }}>
                        {label}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    )
}

function construireGradient(items, total) {
    if (!total) return 'conic-gradient(#e5e7eb 0deg 360deg)'
    let angleActuel = 0
    const segments = items.map((item) => {
        const angle = (item.value / total) * 360
        const segment = `${item.color} ${angleActuel}deg ${angleActuel + angle}deg`
        angleActuel += angle
        return segment
    })
    return `conic-gradient(${segments.join(', ')})`
}

function ChartCard({ title, total, items, anime }) {
    const gradient = construireGradient(items, total)
    return (
        <Card variant="outlined" sx={{ flex: 1, minWidth: 0, borderRadius: 0.5, bgcolor: '#f9fafb', borderColor: '#e5e7eb' }}>
            <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                <Stack spacing={1.75}>
                    <Typography sx={{ fontWeight: 700, fontSize: 19, color: '#1f2937', fontFamily: 'Quicksand, sans-serif' }}>{title}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                background: gradient,
                                display: 'grid',
                                placeItems: 'center',
                                animation: anime ? `${apparition} 1s ease-out` : 'none',
                                transition: 'background 0.8s ease',
                            }}
                        >
                            <Box sx={{ width: 58, height: 58, borderRadius: '50%', bgcolor: '#f9fafb', display: 'grid', placeItems: 'center' }}>
                                <Stack spacing={0} alignItems="center">
                                    <Typography sx={{ fontSize: 19, lineHeight: 1, fontWeight: 700 }}>{total}</Typography>
                                    <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Total</Typography>
                                </Stack>
                            </Box>
                        </Box>
                    </Box>
                    <Stack spacing={0.45}>
                        {items.map((item) => (
                            <Stack key={item.label} direction="row" alignItems="center" spacing={0.75}>
                                <Box sx={{ width: 7, height: 7, borderRadius: '20%', bgcolor: item.color, flexShrink: 0 }} />
                                <Typography noWrap sx={{ fontSize: 16, color: '#374151', flexGrow: 1, fontFamily: 'Quicksand, sans-serif' }}>
                                    {item.label}
                                </Typography>
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1f2937', fontFamily: 'Quicksand, sans-serif' }}>
                                    {item.value}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    )
}

const COULEURS_STATUT = {
    [STATUT_EQUIPEMENT.EN_SERVICE]: '#10b981',
    [STATUT_EQUIPEMENT.EN_STOCK]: '#9ca3af',
    [STATUT_EQUIPEMENT.EN_PANNE]: '#ef4444',
    [STATUT_EQUIPEMENT.MIS_AU_REBUT]: '#111827',
}

const COULEURS_TYPE_CATEGORIE = {
    [TYPE_CATEGORIE.HARDWARE]: '#3b82f6',
    [TYPE_CATEGORIE.SOFTWARE]: '#10b981',
    [TYPE_CATEGORIE.RESEAU]: '#f59e0b',
    [TYPE_CATEGORIE.AUTRE]: '#f97316',
}

const COULEURS_PRIORITE = {
    [PRIORITE_PANNE.FAIBLE]: '#10b981',
    [PRIORITE_PANNE.MOYENNE]: '#f59e0b',
    [PRIORITE_PANNE.ELEVEE]: '#f97316',
    [PRIORITE_PANNE.CRITIQUE]: '#ef4444',
}

export default function EspaceAdminContent() {
    const navigate = useNavigate()
    const [equipements, setEquipements] = useState([])
    const [pannes, setPannes] = useState([])
    const [chargement, setChargement] = useState(true)
    const [erreur, setErreur] = useState('')
    const [anime, setAnime] = useState(false)

    useEffect(() => {
        async function charger() {
            setChargement(true)
            setErreur('')
            try {
                const statuts = Object.values(STATUT_PANNE)
                const [reponseEquipements, reponsesPannes] = await Promise.all([
                    equipementApi.listerTous(),
                    Promise.all(statuts.map((statut) => panneApi.listerParStatut(statut))),
                ])
                setEquipements(reponseEquipements.data)
                setPannes(reponsesPannes.flatMap((r) => r.data))
            } catch {
                setErreur('Impossible de charger le tableau de bord.')
            } finally {
                setChargement(false)
                requestAnimationFrame(() => setAnime(true))
            }
        }
        charger()
    }, [])

    const stats = useMemo(() => {
        const parType = (type) => equipements.filter((e) => e.categorie?.type === type).length
        return {
            total: equipements.length,
            logiciels: parType(TYPE_CATEGORIE.SOFTWARE),
            reseau: parType(TYPE_CATEGORIE.RESEAU),
            materiel: parType(TYPE_CATEGORIE.HARDWARE),
            enPanne: equipements.filter((e) => e.statut === STATUT_EQUIPEMENT.EN_PANNE).length,
            reformes: equipements.filter((e) => e.statut === STATUT_EQUIPEMENT.MIS_AU_REBUT).length,
        }
    }, [equipements])

    const parStatut = Object.values(STATUT_EQUIPEMENT).map((statut) => ({
        label: STATUT_EQUIPEMENT_LABELS[statut],
        value: equipements.filter((e) => e.statut === statut).length,
        color: COULEURS_STATUT[statut],
    }))

    const parCategorie = [TYPE_CATEGORIE.HARDWARE, TYPE_CATEGORIE.SOFTWARE, TYPE_CATEGORIE.RESEAU].map((type) => ({
        label: type === TYPE_CATEGORIE.HARDWARE ? 'Matériel' : type === TYPE_CATEGORIE.SOFTWARE ? 'Logiciels' : 'Réseau',
        value: equipements.filter((e) => e.categorie?.type === type).length,
        color: COULEURS_TYPE_CATEGORIE[type],
    }))

    const parPriorite = Object.values(PRIORITE_PANNE).map((valeur) => ({
        label: PRIORITE_PANNE_LABELS[valeur],
        value: pannes.filter((p) => p.priorite === valeur).length,
        color: COULEURS_PRIORITE[valeur],
    }))

    const derniersEquipements = useMemo(
        () =>
            [...equipements]
                .sort((a, b) => new Date(b.dateAcquisition || 0) - new Date(a.dateAcquisition || 0))
                .slice(0, 7),
        [equipements]
    )

    if (chargement) {
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box component="section" 
        sx={{
            boxSizing: 'border-box',
            p: { xs: 2, sm: 2.5 },
            width: '100%',
            backgroundImage: `linear-gradient(rgba(204, 204, 204, 0.55), rgba(201, 201, 201, 0.75)), url(${backgroundPic})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100%',
        }}> 
            {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}

            <Stack spacing={2.75}>
                <Box component="header">
                    <Typography sx={{ fontSize: { xs: 28, md: 32 }, fontWeight: 700, color: '#1f2937', fontFamily: 'Quicksand, sans-serif' }}>
                        Tableau de bord - Parc Informatique
                    </Typography>
                    <Box sx={{ mt: 0.65, width: 285, maxWidth: '100%', height: 3, bgcolor: '#111827' }} />
                </Box>

                <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <SummaryCard label="Équipements total" valeur={stats.total} backgroundColor="#ecfdf5" iconColor="#14b8a6" Icon={Inventory2Outlined} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <SummaryCard label="Logiciels" valeur={stats.logiciels} backgroundColor="#eff6ff" iconColor="#3b82f6" Icon={DesktopWindowsOutlined} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <SummaryCard label="Réseau" valeur={stats.reseau} backgroundColor="#fff7ed" iconColor="#f59e0b" Icon={LanOutlined} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <SummaryCard label="Matériel" valeur={stats.materiel} backgroundColor="#eff6ff" iconColor="#3b82f6" Icon={MemoryOutlined} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <SummaryCard label="En panne" valeur={stats.enPanne} backgroundColor="#fef2f2" iconColor="#ef4444" Icon={ReportProblemOutlined} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <SummaryCard label="Réformés" valeur={stats.reformes} backgroundColor="#f3f4f6" iconColor="#9ca3af" Icon={DeleteOutline} />
                    </Grid>
                </Grid>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.75}>
                    <ChartCard title="Équipements par statut" total={stats.total} items={parStatut} anime={anime} />
                    <ChartCard title="Équipements par catégorie" total={stats.materiel + stats.logiciels + stats.reseau} items={parCategorie} anime={anime} />
                    <ChartCard title="Pannes par priorité" total={pannes.length} items={parPriorite} anime={anime} />
                </Stack>

                <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 0.5, borderColor: '#e5e7eb' }}>
                    <Stack spacing={1.25}>
                        <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#1f2937', fontFamily: 'Quicksand, sans-serif' }}>
                            Derniers équipements ajoutés
                        </Typography>
                        <TableContainer sx={{ border: '1px solid #e5e7eb', borderRadius: 0.5 }}>
                            <Table size="small" sx={{ minWidth: 850 }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                                        {['Code Inventaire', 'Nom', 'Catégorie', 'Localisation', 'Statut', 'Agent Affecté', "Date d'acquisition", ''].map(
                                            (label) => (
                                                <TableCell key={label} sx={{ fontWeight: 700, fontSize: 18, color: '#374151' }}>
                                                    {label}
                                                </TableCell>
                                            )
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {derniersEquipements.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                                Aucun équipement.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        derniersEquipements.map((equipement, index) => (
                                            <TableRow key={equipement.idEquipement} hover sx={{ bgcolor: index % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                                <TableCell sx={{ fontSize: 18, color: '#6b7280' }}>{equipement.codeInventaire}</TableCell>
                                                <TableCell sx={{ fontSize: 18, fontWeight: 600, color: '#374151' }}>{equipement.nom}</TableCell>
                                                <TableCell sx={{ fontSize: 18, color: '#6b7280' }}>{equipement.categorie?.libelle || '—'}</TableCell>
                                                <TableCell sx={{ fontSize: 18, color: '#6b7280' }}>{libelleLocalisation(equipement.localisation)}</TableCell>
                                                <TableCell>
                                                    <StatusChip type="statutEquipement" value={equipement.statut} />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 18, color: '#6b7280' }}>
                                                    {equipement.agent ? `${equipement.agent.nom} ${equipement.agent.prenom}` : 'Non affecté'}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 18, color: '#6b7280' }}>{formaterDate(equipement.dateAcquisition)}</TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title={`Voir ${equipement.nom}`}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => navigate(`/parc/equipements/${equipement.idEquipement}`)}
                                                            sx={{ width: 22, height: 22, bgcolor: '#eff6ff', color: '#3b82f6', '&:hover': { bgcolor: '#dbeafe' } }}
                                                        >
                                                            <AddIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    )
}