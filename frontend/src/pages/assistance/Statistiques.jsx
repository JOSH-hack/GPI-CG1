/*

Nom du fichier   : Statistiques.jsx
Objectif         : Page Statistiques - Assistance, fidele a la maquette
                    statistiques-assistance.pdf (filtres periode/annexe, 4 KPIs
                    avec delta, evolution des pannes, repartition par priorite,
                    top 5 equipements en panne, charge de travail technicien,
                    tableau detail des equipements, export PDF)
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import StarIcon from '@mui/icons-material/Star'
import DownloadOutlined from '@mui/icons-material/DownloadOutlined'
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'

import { equipementApi } from '../../api/equipementApi'
import { panneApi } from '../../api/panneApi'
import { interventionApi } from '../../api/interventionApi'
import { exportApi } from '../../api/exportApi'
import {
    STATUT_PANNE,
    PRIORITE_PANNE,
    PRIORITE_PANNE_LABELS,
    STATUT_EQUIPEMENT,
    STATUT_EQUIPEMENT_LABELS,
    ANNEXES,
    ANNEXE_LABELS,
} from '../../utils/constants'
import StatusChip from '../../components/common/StatusChip'

const PERIODES = [
    { valeur: 1, label: '1 mois' },
    { valeur: 3, label: '3 mois' },
    { valeur: 6, label: '6 mois' },
    { valeur: 12, label: '12 mois' },
    { valeur: 'PERSONNALISE', label: 'Personnalisé' },
]

const COULEURS_PRIORITE = {
    [PRIORITE_PANNE.FAIBLE]: '#10b981',
    [PRIORITE_PANNE.MOYENNE]: '#f59e0b',
    [PRIORITE_PANNE.ELEVEE]: '#f97316',
    [PRIORITE_PANNE.CRITIQUE]: '#ef4444',
}

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function libelleLocalisation(loc) {
    if (!loc) return '—'
    return [loc.annexe, loc.service, loc.bureau].filter(Boolean).join(' - ')
}

function formaterDate(valeur) {
    if (!valeur) return '—'
    return new Date(valeur).toLocaleDateString('fr-FR')
}

function joursEntre(debut, fin) {
    return (new Date(fin) - new Date(debut)) / (1000 * 60 * 60 * 24)
}

function KpiCard({ label, valeur, delta, deltaAmelioration }) {
    const positif = delta > 0
    const estAmelioration = deltaAmelioration
    const couleur = delta === 0 ? '#9ca3af' : estAmelioration ? '#1b7548' : '#dc5e60'
    const Icone = positif ? ArrowUpwardIcon : ArrowDownwardIcon

    return (
        <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2, borderColor: '#e5e7eb', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography sx={{ fontSize: 26, fontWeight: 700, color: '#1f2937', fontFamily: 'Quicksand, sans-serif' }}>
                    {valeur}
                </Typography>
                {delta !== null && (
                    <Chip
                        size="small"
                        icon={<Icone sx={{ fontSize: '14px !important', color: `${couleur} !important` }} />}
                        label={`${positif ? '+' : ''}${delta}`}
                        sx={{ bgcolor: `${couleur}1a`, color: couleur, fontWeight: 700, fontSize: 11, height: 22 }}
                    />
                )}
            </Stack>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#6b7280', fontFamily: 'Quicksand, sans-serif', mt: 0.5 }}>
                {label}
            </Typography>
        </Paper>
    )
}

function construireGradient(items, total) {
    if (!total) return 'conic-gradient(#e5e7eb 0deg 360deg)'
    let angle = 0
    const segments = items.map((item) => {
        const a = (item.value / total) * 360
        const s = `${item.color} ${angle}deg ${angle + a}deg`
        angle += a
        return s
    })
    return `conic-gradient(${segments.join(', ')})`
}

function PrioriteDonut({ items, total }) {
    const gradient = construireGradient(items, total)
    return (
        <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2, borderColor: '#e5e7eb', height: '100%' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1f2937', fontFamily: 'Quicksand, sans-serif', mb: 1.5 }}>
                Répartition par priorité
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
                <Box
                    sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: gradient,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                    }}
                >
                    <Box sx={{ width: 58, height: 58, borderRadius: '50%', bgcolor: '#fff', display: 'grid', placeItems: 'center' }}>
                        <Stack spacing={0} alignItems="center">
                            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{total ? '100%' : '0%'}</Typography>
                            <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Pannes</Typography>
                        </Stack>
                    </Box>
                </Box>
                <Stack spacing={0.6}>
                    {items.map((item) => (
                        <Stack key={item.label} direction="row" alignItems="center" spacing={0.75}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                            <Typography sx={{ fontSize: 12, color: '#374151', fontFamily: 'Quicksand, sans-serif' }}>
                                {item.label} ({total ? Math.round((item.value / total) * 100) : 0}%)
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </Stack>
        </Paper>
    )
}

export default function Statistiques() {
    const navigate = useNavigate()

    const [equipements, setEquipements] = useState([])
    const [pannes, setPannes] = useState([])
    const [interventions, setInterventions] = useState([])
    const [chargement, setChargement] = useState(true)
    const [erreur, setErreur] = useState('')

    const [periode, setPeriode] = useState(3)
    const [dateDebutPerso, setDateDebutPerso] = useState('')
    const [dateFinPerso, setDateFinPerso] = useState('')
    const [annexe, setAnnexe] = useState('TOUTE')
    const [genererDeclenche, setGenererDeclenche] = useState(0)

    const [triCategorie, setTriCategorie] = useState('')
    const [triStatut, setTriStatut] = useState('')
    const [recherche, setRecherche] = useState('')
    const [page, setPage] = useState(1)
    const [selection, setSelection] = useState([])
    const [exportEnCours, setExportEnCours] = useState(false)

    useEffect(() => {
        async function charger() {
            setChargement(true)
            setErreur('')
            try {
                const statuts = Object.values(STATUT_PANNE)
                const [resEquipements, resPannes, resInterventions] = await Promise.all([
                    equipementApi.listerTous(),
                    Promise.all(statuts.map((s) => panneApi.listerParStatut(s))),
                    interventionApi.listerToutes(),
                ])
                setEquipements(resEquipements.data)
                setPannes(resPannes.flatMap((r) => r.data))
                setInterventions(resInterventions.data)
            } catch {
                setErreur('Impossible de charger les statistiques.')
            } finally {
                setChargement(false)
            }
        }
        charger()
    }, [])

    // Bornes de la periode courante et de la periode precedente (pour les deltas)
    const { debut, fin, debutPrecedent, finPrecedent } = useMemo(() => {
        const maintenant = new Date()
        let d, f
        if (periode === 'PERSONNALISE' && dateDebutPerso && dateFinPerso) {
            d = new Date(dateDebutPerso)
            f = new Date(dateFinPerso)
        } else {
            f = maintenant
            d = new Date(maintenant)
            d.setMonth(d.getMonth() - (typeof periode === 'number' ? periode : 3))
        }
        const dureeJours = joursEntre(d, f)
        const fPrec = new Date(d)
        const dPrec = new Date(d)
        dPrec.setDate(dPrec.getDate() - dureeJours)
        return { debut: d, fin: f, debutPrecedent: dPrec, finPrecedent: fPrec }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periode, dateDebutPerso, dateFinPerso, genererDeclenche])

    function dansPeriode(dateIso, d, f) {
        if (!dateIso) return false
        const date = new Date(dateIso)
        return date >= d && date <= f
    }

    function filtrerParAnnexe(liste, accesseurLocalisation) {
        if (annexe === 'TOUTE') return liste
        return liste.filter((item) => accesseurLocalisation(item)?.annexe === annexe)
    }

    const pannesPeriode = useMemo(
        () => filtrerParAnnexe(pannes.filter((p) => dansPeriode(p.dateSurvenance, debut, fin)), (p) => p.equipement?.localisation),
        [pannes, debut, fin, annexe]
    )
    const pannesPeriodePrecedente = useMemo(
        () =>
            filtrerParAnnexe(
                pannes.filter((p) => dansPeriode(p.dateSurvenance, debutPrecedent, finPrecedent)),
                (p) => p.equipement?.localisation
            ),
        [pannes, debutPrecedent, finPrecedent, annexe]
    )
    const interventionsPeriode = useMemo(
        () =>
            filtrerParAnnexe(
                interventions.filter((i) => dansPeriode(i.dateIntervention, debut, fin)),
                (i) => i.panne?.equipement?.localisation
            ),
        [interventions, debut, fin, annexe]
    )

    function calculerKpis(pannesRef, interventionsRef) {
        const resolues = interventionsRef.filter((i) => i.dateResolution && i.panne?.dateSurvenance)
        const tempsMoyen = resolues.length
            ? resolues.reduce((somme, i) => somme + joursEntre(i.panne.dateSurvenance, i.dateResolution), 0) / resolues.length
            : 0
        const nbReparees = pannesRef.filter((p) => p.statut === STATUT_PANNE.REPAREE).length
        const tauxResolution = pannesRef.length ? (nbReparees / pannesRef.length) * 100 : 0
        const notes = pannesRef.filter((p) => p.noteSatisfaction).map((p) => p.noteSatisfaction)
        const noteMoyenne = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : 0
        const pannesParEquipement = equipements.length ? pannesRef.length / equipements.length : 0
        return { tempsMoyen, tauxResolution, noteMoyenne, pannesParEquipement }
    }

    const kpisActuels = useMemo(
        () => calculerKpis(pannesPeriode, interventionsPeriode),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [pannesPeriode, interventionsPeriode, equipements]
    )
    const kpisPrecedents = useMemo(
        () => calculerKpis(pannesPeriodePrecedente, interventions.filter((i) => dansPeriode(i.dateIntervention, debutPrecedent, finPrecedent))),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [pannesPeriodePrecedente, interventions, debutPrecedent, finPrecedent, equipements]
    )

    const parPriorite = Object.values(PRIORITE_PANNE).map((valeur) => ({
        label: PRIORITE_PANNE_LABELS[valeur],
        value: pannesPeriode.filter((p) => p.priorite === valeur).length,
        color: COULEURS_PRIORITE[valeur],
    }))

    const top5Categories = useMemo(() => {
        const compteur = {}
        pannesPeriode.forEach((p) => {
            const libelle = p.equipement?.categorie?.libelle || 'Autre'
            compteur[libelle] = (compteur[libelle] || 0) + 1
        })
        return Object.entries(compteur)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
    }, [pannesPeriode])

    const chargeTechniciens = useMemo(() => {
        const compteur = {}
        interventionsPeriode.forEach((i) => {
            const nom = i.technicien ? `${i.technicien.nom}` : 'Non assigné'
            compteur[nom] = (compteur[nom] || 0) + 1
        })
        return Object.entries(compteur)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
    }, [interventionsPeriode])

    const nombreMoisAffiches = periode === 'PERSONNALISE' ? 6 : Math.min(12, periode)
    const evolutionMensuelle = useMemo(() => {
        const maintenant = new Date()
        return Array.from({ length: nombreMoisAffiches }, (_, i) => {
            const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - (nombreMoisAffiches - 1 - i), 1)
            const compte = pannes.filter((p) => {
                if (!p.dateSurvenance) return false
                const d = new Date(p.dateSurvenance)
                return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
            }).length
            return { label: MOIS_LABELS[date.getMonth()], value: compte }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pannes, nombreMoisAffiches])
    const maxEvolution = Math.max(1, ...evolutionMensuelle.map((m) => m.value))

    const equipementsFiltres = useMemo(() => {
        const query = recherche.trim().toLowerCase()
        let liste = equipements.filter((e) => {
            const matchRecherche =
                !query || [e.codeInventaire, e.nom].filter(Boolean).some((v) => String(v).toLowerCase().includes(query))
            return matchRecherche
        })
        if (triCategorie) liste = [...liste].sort((a, b) => (a.categorie?.libelle || '').localeCompare(b.categorie?.libelle || ''))
        if (triStatut) liste = [...liste].sort((a, b) => (a.statut || '').localeCompare(b.statut || ''))
        return liste
    }, [equipements, recherche, triCategorie, triStatut])

    const parPage = 10
    const nombrePages = Math.max(1, Math.ceil(equipementsFiltres.length / parPage))
    const pageActuelle = Math.min(page, nombrePages)
    const equipementsAffiches = equipementsFiltres.slice((pageActuelle - 1) * parPage, pageActuelle * parPage)

    async function handleExportPdf() {
        setExportEnCours(true)
        try {
            await exportApi.exporterPdf()
        } catch {
            setErreur("Impossible de générer l'export.")
        } finally {
            setExportEnCours(false)
        }
    }

    function toggleSelectAll(event) {
        setSelection(event.target.checked ? equipementsAffiches.map((e) => e.idEquipement) : [])
    }
    function toggleSelectRow(id) {
        setSelection((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
    }

    if (chargement) {
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box component="section" sx={{ p: { xs: 2, md: 3 }, width: '100%', boxSizing: 'border-box', flex: 1, minHeight: '100%' }}>
            {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}

            <Stack spacing={2.5}>
                <Box>
                    <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 700, color: '#1f2937', fontFamily: 'Quicksand, sans-serif' }}>
                        Statistiques - Assistance
                    </Typography>
                    <Box sx={{ mt: 0.65, width: 260, maxWidth: '100%', height: 3, bgcolor: '#111827' }} />
                </Box>

                {/* Barre de filtres */}
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2, borderColor: '#e5e7eb' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {PERIODES.map((p) => (
                                <Button
                                    key={p.valeur}
                                    size="small"
                                    onClick={() => setPeriode(p.valeur)}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '999px',
                                        px: 1.5,
                                        bgcolor: periode === p.valeur ? '#0c5d7d' : 'transparent',
                                        color: periode === p.valeur ? '#fff' : '#374151',
                                        fontWeight: periode === p.valeur ? 700 : 500,
                                        '&:hover': { bgcolor: periode === p.valeur ? '#094a63' : 'rgba(0,0,0,0.04)' },
                                    }}
                                >
                                    {p.label}
                                </Button>
                            ))}
                        </Stack>

                        {periode === 'PERSONNALISE' && (
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    type="date"
                                    size="small"
                                    value={dateDebutPerso}
                                    onChange={(e) => setDateDebutPerso(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    type="date"
                                    size="small"
                                    value={dateFinPerso}
                                    onChange={(e) => setDateFinPerso(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Stack>
                        )}

                        <Select size="small" value={annexe} onChange={(e) => setAnnexe(e.target.value)} sx={{ minWidth: 190 }}>
                            <MenuItem value="TOUTE">Annexe : Toute la commune</MenuItem>
                            {Object.values(ANNEXES).map((a) => (
                                <MenuItem key={a} value={a}>
                                    {ANNEXE_LABELS[a]}
                                </MenuItem>
                            ))}
                        </Select>

                        <Box sx={{ flex: 1 }} />

                        <Button
                            variant="contained"
                            onClick={() => setGenererDeclenche((n) => n + 1)}
                            sx={{ bgcolor: '#0c5d7d', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#094a63' } }}
                        >
                            Générer le rapport
                        </Button>
                    </Stack>
                </Paper>

                {/* KPIs */}
                <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6} md={3}>
                        <KpiCard
                            label="Temps moyen de résolution"
                            valeur={`${kpisActuels.tempsMoyen.toFixed(1)} jours`}
                            delta={Number((kpisActuels.tempsMoyen - kpisPrecedents.tempsMoyen).toFixed(1))}
                            deltaAmelioration={kpisActuels.tempsMoyen <= kpisPrecedents.tempsMoyen}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <KpiCard
                            label="Taux de résolution"
                            valeur={`${Math.round(kpisActuels.tauxResolution)}%`}
                            delta={Math.round(kpisActuels.tauxResolution - kpisPrecedents.tauxResolution)}
                            deltaAmelioration={kpisActuels.tauxResolution >= kpisPrecedents.tauxResolution}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2, borderColor: '#e5e7eb', height: '100%' }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography sx={{ fontSize: 26, fontWeight: 700, color: '#1f2937', fontFamily: 'Quicksand, sans-serif' }}>
                                    {kpisActuels.noteMoyenne.toFixed(1)}/5
                                </Typography>
                                <StarIcon sx={{ color: '#e6a817', fontSize: 20 }} />
                            </Stack>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#6b7280', fontFamily: 'Quicksand, sans-serif', mt: 0.5 }}>
                                Note moyenne de satisfaction
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <KpiCard
                            label="Pannes par équipement"
                            valeur={kpisActuels.pannesParEquipement.toFixed(1)}
                            delta={Number((kpisActuels.pannesParEquipement - kpisPrecedents.pannesParEquipement).toFixed(1))}
                            deltaAmelioration={kpisActuels.pannesParEquipement <= kpisPrecedents.pannesParEquipement}
                        />
                    </Grid>
                </Grid>

                {/* Evolution + repartition */}
                <Grid container spacing={1.5}>
                    <Grid item xs={12} md={7}>
                        <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2, borderColor: '#e5e7eb', height: '100%' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1f2937', fontFamily: 'Quicksand, sans-serif', mb: 1.5 }}>
                                Évolution des pannes sur la période
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ height: 160 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, flex: 1, minHeight: 140 }}>
                                    {evolutionMensuelle.map((mois, index) => (
                                        <Box key={`${mois.label}-${index}`} sx={{ flex: 1, textAlign: 'center' }}>
                                            <Box
                                                sx={{
                                                    height: `${(mois.value / maxEvolution) * 120}px`,
                                                    bgcolor: '#a7d8c9',
                                                    borderRadius: 1,
                                                    mx: 'auto',
                                                    width: '70%',
                                                    transition: 'height 0.5s ease',
                                                }}
                                            />
                                            <Typography sx={{ fontSize: 10, color: '#9ca3af', mt: 0.5 }}>{mois.label}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <PrioriteDonut items={parPriorite} total={pannesPeriode.length} />
                    </Grid>
                </Grid>

                {/* Top 5 + charge technicien */}
                <Grid container spacing={1.5}>
                    <Grid item xs={12} md={7}>
                        <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2, borderColor: '#e5e7eb', height: '100%' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1f2937', fontFamily: 'Quicksand, sans-serif', mb: 1.5 }}>
                                Top 5 des équipements les plus en panne
                            </Typography>
                            <Stack spacing={1.25}>
                                {top5Categories.length === 0 ? (
                                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Aucune donnée sur la période.</Typography>
                                ) : (
                                    top5Categories.map((item) => {
                                        const max = top5Categories[0].value
                                        return (
                                            <Stack key={item.label} direction="row" alignItems="center" spacing={1}>
                                                <Typography sx={{ width: 100, fontSize: 12, color: '#374151', flexShrink: 0 }}>{item.label}</Typography>
                                                <Box sx={{ flex: 1, bgcolor: '#e5e7eb', borderRadius: 1, height: 14 }}>
                                                    <Box
                                                        sx={{
                                                            width: `${(item.value / max) * 100}%`,
                                                            height: '100%',
                                                            bgcolor: '#3b82f6',
                                                            borderRadius: 1,
                                                        }}
                                                    />
                                                </Box>
                                                <Typography sx={{ width: 24, fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{item.value}</Typography>
                                            </Stack>
                                        )
                                    })
                                )}
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2, borderColor: '#e5e7eb', height: '100%' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1f2937', fontFamily: 'Quicksand, sans-serif', mb: 1.5 }}>
                                Charge de travail par technicien
                            </Typography>
                            <Stack direction="row" spacing={1.5} alignItems="flex-end" sx={{ height: 140 }}>
                                {chargeTechniciens.length === 0 ? (
                                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Aucune donnée sur la période.</Typography>
                                ) : (
                                    chargeTechniciens.map((item) => {
                                        const max = chargeTechniciens[0].value
                                        return (
                                            <Box key={item.label} sx={{ flex: 1, textAlign: 'center' }}>
                                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#1f2937' }}>{item.value}</Typography>
                                                <Box
                                                    sx={{
                                                        height: `${(item.value / max) * 90}px`,
                                                        bgcolor: '#8b5cf6',
                                                        borderRadius: 1,
                                                        mx: 'auto',
                                                        width: '55%',
                                                        mt: 0.5,
                                                    }}
                                                />
                                                <Typography sx={{ fontSize: 10, color: '#6b7280', mt: 0.5 }}>{item.label}</Typography>
                                            </Box>
                                        )
                                    })
                                )}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Detail des equipements */}
                <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2, borderColor: '#e5e7eb' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1f2937', fontFamily: 'Quicksand, sans-serif' }}>
                            Détail des équipements
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Select size="small" displayEmpty value={triCategorie} onChange={(e) => setTriCategorie(e.target.value)}>
                                <MenuItem value="">Trier par Catégorie</MenuItem>
                                <MenuItem value="categorie">Catégorie (A→Z)</MenuItem>
                            </Select>
                            <Select size="small" displayEmpty value={triStatut} onChange={(e) => setTriStatut(e.target.value)}>
                                <MenuItem value="">Trier par Statut</MenuItem>
                                <MenuItem value="statut">Statut (A→Z)</MenuItem>
                            </Select>
                            <TextField
                                size="small"
                                placeholder="Recherche rapide..."
                                value={recherche}
                                onChange={(e) => {
                                    setRecherche(e.target.value)
                                    setPage(1)
                                }}
                            />
                        </Stack>
                    </Stack>

                    <TableContainer sx={{ border: '1px solid #e5e7eb', borderRadius: 1 }}>
                        <Table size="small" sx={{ minWidth: 900 }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            size="small"
                                            checked={selection.length > 0 && selection.length === equipementsAffiches.length}
                                            indeterminate={selection.length > 0 && selection.length < equipementsAffiches.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </TableCell>
                                    {['Code inventaire', 'Nom', 'Catégorie', 'Localisation', 'Statut', 'Agent affecté', "Date d'acquisition", ''].map((label) => (
                                        <TableCell key={label} sx={{ fontWeight: 700, fontSize: 12, color: '#374151' }}>
                                            {label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {equipementsAffiches.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                                            Aucun équipement.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    equipementsAffiches.map((equipement, index) => (
                                        <TableRow key={equipement.idEquipement} hover sx={{ bgcolor: index % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    size="small"
                                                    checked={selection.includes(equipement.idEquipement)}
                                                    onChange={() => toggleSelectRow(equipement.idEquipement)}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 12, color: '#6b7280' }}>{equipement.codeInventaire}</TableCell>
                                            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{equipement.nom}</TableCell>
                                            <TableCell sx={{ fontSize: 12, color: '#6b7280' }}>{equipement.categorie?.libelle || '—'}</TableCell>
                                            <TableCell sx={{ fontSize: 12, color: '#6b7280' }}>{libelleLocalisation(equipement.localisation)}</TableCell>
                                            <TableCell>
                                                <StatusChip type="statutEquipement" value={equipement.statut} />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 12, color: '#6b7280' }}>
                                                {equipement.agent ? `${equipement.agent.nom} ${equipement.agent.prenom}` : 'Non affecté'}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 12, color: '#6b7280' }}>{formaterDate(equipement.dateAcquisition)}</TableCell>
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

                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Typography sx={{ fontSize: 13, color: '#6b7280' }}>Lignes affichées :</Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{parPage}</Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Button size="small" disabled={pageActuelle === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} sx={{ textTransform: 'none' }}>
                                Précédent
                            </Button>
                            {Array.from({ length: Math.min(3, nombrePages) }, (_, i) => i + 1).map((n) => (
                                <Button
                                    key={n}
                                    size="small"
                                    variant={pageActuelle === n ? 'contained' : 'outlined'}
                                    onClick={() => setPage(n)}
                                    sx={{ minWidth: 32, bgcolor: pageActuelle === n ? '#0c5d7d' : '#fff', color: pageActuelle === n ? '#fff' : '#0c5d7d' }}
                                >
                                    {n}
                                </Button>
                            ))}
                            {nombrePages > 3 && <Typography sx={{ px: 0.5, color: '#9ca3af' }}>...</Typography>}
                            <Button size="small" disabled={pageActuelle === nombrePages} onClick={() => setPage((p) => Math.min(nombrePages, p + 1))} sx={{ textTransform: 'none' }}>
                                Suivant
                            </Button>
                        </Stack>

                        <Button
                            variant="contained"
                            size="small"
                            startIcon={exportEnCours ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <DownloadOutlined />}
                            onClick={handleExportPdf}
                            disabled={exportEnCours}
                            sx={{ bgcolor: '#1b7548', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#145d39' } }}
                        >
                            Exporter en PDF
                        </Button>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    )
}