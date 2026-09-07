/*

Nom du fichier   : Liste.jsx
Objectif         : Page "Historique des mouvements" (module Gestion) - liste
                    filtrable par type/equipement + modal "Enregistrer un
                    mouvement" (deplacement ou affectation), fidele aux
                    maquettes GEstion_Mouvement / GEstion-Mouvement-Modal
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import backgroundPic from '../../assets/background/backgroundpic.png'
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    MenuItem,
    Radio,
    RadioGroup,
    FormControlLabel,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material'

import { historiqueApi } from '../../api/historiqueApi'
import { equipementApi } from '../../api/equipementApi'
import { localisationApi } from '../../api/localisationApi'
import { agentApi } from '../../api/agentApi'
import { TYPE_MOUVEMENT, TYPE_MOUVEMENT_LABELS } from '../../utils/constants'

const COULEURS_TYPE = {
    [TYPE_MOUVEMENT.DEPLACEMENT]: '#3b82f6',
    [TYPE_MOUVEMENT.AFFECTATION]: '#1b7548',
    [TYPE_MOUVEMENT.CHANGEMENT_STATUT]: '#ea8c2e',
    [TYPE_MOUVEMENT.MISE_AU_REBUT]: '#6b7280',
}

const controlSx = {
    '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px', fontFamily: 'Quicksand, sans-serif' },
}

function formaterDate(valeur) {
    if (!valeur) return '—'
    return new Date(valeur).toLocaleDateString('fr-FR')
}

function libelleLocalisation(loc) {
    if (!loc) return '—'
    return [loc.annexe, loc.service].filter(Boolean).join(' - ')
}

export default function MouvementsListe() {
    const [mouvements, setMouvements] = useState([])
    const [equipements, setEquipements] = useState([])
    const [chargement, setChargement] = useState(true)
    const [erreur, setErreur] = useState('')

    const [filtreType, setFiltreType] = useState('TOUS')
    const [rechercheEquipement, setRechercheEquipement] = useState('')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState('10')

    const [modalOuvert, setModalOuvert] = useState(false)

    async function charger() {
        setChargement(true)
        setErreur('')
        try {
            const [resMouvements, resEquipements] = await Promise.all([
                historiqueApi.listerTout(),
                equipementApi.listerTous(),
            ])
            setMouvements(resMouvements.data)
            setEquipements(resEquipements.data)
        } catch {
            setErreur("Impossible de charger l'historique des mouvements.")
        } finally {
            setChargement(false)
        }
    }

    useEffect(() => {
        charger()
    }, [])

    const mouvementsFiltres = useMemo(() => {
        const query = rechercheEquipement.trim().toLowerCase()
        return mouvements.filter((m) => {
            const matchType = filtreType === 'TOUS' || m.typeMouvement === filtreType
            const matchRecherche = !query || (m.equipement?.codeInventaire || '').toLowerCase().includes(query)
            return matchType && matchRecherche
        })
    }, [mouvements, filtreType, rechercheEquipement])

    const parPage = Number(rowsPerPage)
    const nombrePages = Math.max(1, Math.ceil(mouvementsFiltres.length / parPage))
    const pageActuelle = Math.min(page, nombrePages)
    const mouvementsAffiches = mouvementsFiltres.slice((pageActuelle - 1) * parPage, pageActuelle * parPage)


    return (
        <Box
            component="section"
            sx={{
                position: 'relative',
                p: { xs: 1.5, sm: 3 },
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'Quicksand, sans-serif',
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
                    opacity: 0.15,
                }}
            />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography sx={{ color: '#0c5d7d', fontSize: 24, fontWeight: 700 }}>Historique des mouvements</Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 170, ...controlSx }}>
                        <Select value={filtreType} onChange={(e) => { setFiltreType(e.target.value); setPage(1) }}>
                            <MenuItem value="TOUS">Tous</MenuItem>
                            {Object.values(TYPE_MOUVEMENT).map((t) => (
                                <MenuItem key={t} value={t}>{TYPE_MOUVEMENT_LABELS[t]}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        placeholder="Rechercher un équipement"
                        value={rechercheEquipement}
                        onChange={(e) => { setRechercheEquipement(e.target.value); setPage(1) }}
                        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 0.75, color: '#0c5d7d', fontSize: 18 }} /> }}
                        sx={{ width: 220, ...controlSx }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setModalOuvert(true)}
                        sx={{ bgcolor: '#147042', textTransform: 'none', whiteSpace: 'nowrap', '&:hover': { bgcolor: '#0f5a35' } }}
                    >
                        Enregistrer un mouvement
                    </Button>
                </Stack>
            </Box>
         <Box />
            {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}

            <TableContainer sx={{ border: '1px solid #157042', borderRadius: '12px', overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 1000 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#0c5d7d' }}>
                            {['Date', 'Équipement', 'Type de mouvement', 'Ancienne valeur', 'Nouvelle valeur', 'Motif', 'Opérateur'].map((label) => (
                                <TableCell key={label} sx={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
                                    {label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {chargement ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : mouvementsAffiches.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    Aucun mouvement trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            mouvementsAffiches.map((m, index) => (
                                <TableRow key={m.idMouvement} sx={{ bgcolor: index % 2 === 0 ? '#fff' : '#f3f4f6' }}>
                                    <TableCell sx={{ fontSize: 14, color: '#0c5d7d', fontWeight: 600 }}>{formaterDate(m.dateMouvement)}</TableCell>
                                    <TableCell sx={{ fontSize: 14, color: '#0c5d7d', fontWeight: 600 }}>{m.equipement?.codeInventaire}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={TYPE_MOUVEMENT_LABELS[m.typeMouvement]}
                                            size="small"
                                            sx={{ bgcolor: COULEURS_TYPE[m.typeMouvement], color: '#fff', fontWeight: 700 }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 14, color: '#0c5d7d' }}>{m.ancienneValeur}</TableCell>
                                    <TableCell sx={{ fontSize: 14, color: '#0c5d7d' }}>{m.nouvelleValeur}</TableCell>
                                    <TableCell sx={{ fontSize: 14, color: '#0c5d7d' }}>{m.motif}</TableCell>
                                    <TableCell sx={{ fontSize: 14, color: '#0c5d7d' }}>
                                        {m.operateur ? `${m.operateur.nom} ${m.operateur.prenom}` : '—'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography sx={{ color: '#0c5d7d', fontSize: 14 }}>Lignes affichées</Typography>
                    <FormControl size="small" sx={{ minWidth: 60, ...controlSx }}>
                        <Select value={rowsPerPage} onChange={(e) => { setRowsPerPage(e.target.value); setPage(1) }}>
                            <MenuItem value="10">10</MenuItem>
                            <MenuItem value="20">20</MenuItem>
                            <MenuItem value="50">50</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <Stack direction="row" spacing={0.5}>
                    <Button variant="outlined" disabled={pageActuelle === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} sx={{ textTransform: 'none' }}>
                        Précédent
                    </Button>
                    {Array.from({ length: nombrePages }, (_, i) => i + 1).map((n) => (
                        <Button
                            key={n}
                            variant={pageActuelle === n ? 'contained' : 'outlined'}
                            onClick={() => setPage(n)}
                            sx={{ minWidth: 36, bgcolor: pageActuelle === n ? '#0c5d7d' : '#fff', color: pageActuelle === n ? '#fff' : '#0c5d7d' }}
                        >
                            {n}
                        </Button>
                    ))}
                    <Button variant="outlined" disabled={pageActuelle === nombrePages} onClick={() => setPage((p) => Math.min(nombrePages, p + 1))} sx={{ textTransform: 'none' }}>
                        Suivant
                    </Button>
                </Stack>
            </Stack>

            <ModalEnregistrerMouvement
                ouvert={modalOuvert}
                onFermer={() => setModalOuvert(false)}
                equipements={equipements}
                onEnregistre={() => { setModalOuvert(false); charger() }}
            />
        </Box>
    )
}

function ModalEnregistrerMouvement({ ouvert, onFermer, equipements, onEnregistre }) {
    const [equipementChoisi, setEquipementChoisi] = useState(null)
    const [type, setType] = useState(TYPE_MOUVEMENT.DEPLACEMENT)
    const [localisations, setLocalisations] = useState([])
    const [agents, setAgents] = useState([])
    const [nouvelleLocalisation, setNouvelleLocalisation] = useState('')
    const [nouvelAgent, setNouvelAgent] = useState('')
    const [motif, setMotif] = useState('')
    const [envoi, setEnvoi] = useState(false)
    const [erreur, setErreur] = useState('')

    useEffect(() => {
        if (!ouvert) return
        localisationApi.listerToutes().then((res) => setLocalisations(res.data)).catch(() => setLocalisations([]))
        agentApi.listerTous().then((res) => setAgents(res.data)).catch(() => setAgents([]))
        setEquipementChoisi(null)
        setType(TYPE_MOUVEMENT.DEPLACEMENT)
        setNouvelleLocalisation('')
        setNouvelAgent('')
        setMotif('')
        setErreur('')
    }, [ouvert])

    async function handleEnregistrer() {
        setErreur('')
        if (!equipementChoisi) {
            setErreur('Sélectionnez un équipement.')
            return
        }
        setEnvoi(true)
        try {
            if (type === TYPE_MOUVEMENT.DEPLACEMENT) {
                if (!nouvelleLocalisation || !motif.trim()) {
                    setErreur('Sélectionnez la nouvelle localisation et indiquez un motif.')
                    setEnvoi(false)
                    return
                }
                await equipementApi.deplacer(equipementChoisi.idEquipement, Number(nouvelleLocalisation), motif.trim())
            } else {
                if (!nouvelAgent) {
                    setErreur('Sélectionnez le nouvel agent.')
                    setEnvoi(false)
                    return
                }
                await equipementApi.affecterAgent(equipementChoisi.idEquipement, Number(nouvelAgent))
            }
            onEnregistre()
        } catch (err) {
            setErreur(err.response?.data?.message || "Impossible d'enregistrer ce mouvement.")
        } finally {
            setEnvoi(false)
        }
    }

    const ancienneLocalisationTexte = equipementChoisi ? libelleLocalisation(equipementChoisi.localisation) : ''
    const ancienAgentTexte = equipementChoisi
        ? equipementChoisi.agent
            ? `${equipementChoisi.agent.nom} ${equipementChoisi.agent.prenom}`
            : 'Non affecté'
        : ''

    return (
        <Dialog open={ouvert} onClose={onFermer} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0c5d7d', fontWeight: 700 }}>
                Enregistrer un mouvement
                <IconButton onClick={onFermer} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    {erreur && <Alert severity="error">{erreur}</Alert>}

                    <Autocomplete
                        options={equipements}
                        value={equipementChoisi}
                        onChange={(_, valeur) => setEquipementChoisi(valeur)}
                        getOptionLabel={(o) => `${o.codeInventaire} — ${o.nom}`}
                        isOptionEqualToValue={(o, v) => o.idEquipement === v.idEquipement}
                        renderInput={(params) => <TextField {...params} label="Équipement" placeholder="Rechercher un équipement..." />}
                    />

                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0c5d7d', mb: 0.5 }}>Type de mouvement</Typography>
                        <RadioGroup row value={type} onChange={(e) => setType(e.target.value)}>
                            <FormControlLabel value={TYPE_MOUVEMENT.DEPLACEMENT} control={<Radio />} label="Déplacement" />
                            <FormControlLabel value={TYPE_MOUVEMENT.AFFECTATION} control={<Radio />} label="Affectation" />
                        </RadioGroup>
                    </Box>

                    {type === TYPE_MOUVEMENT.DEPLACEMENT ? (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField label="Ancienne localisation" value={ancienneLocalisationTexte} InputProps={{ readOnly: true }} fullWidth />
                            <TextField
                                select
                                label="Nouvelle localisation"
                                value={nouvelleLocalisation}
                                onChange={(e) => setNouvelleLocalisation(e.target.value)}
                                fullWidth
                            >
                                {localisations.map((l) => (
                                    <MenuItem key={l.idLocalisation} value={l.idLocalisation}>
                                        {libelleLocalisation(l)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    ) : (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField label="Ancien agent" value={ancienAgentTexte} InputProps={{ readOnly: true }} fullWidth />
                            <TextField
                                select
                                label="Nouvel agent"
                                value={nouvelAgent}
                                onChange={(e) => setNouvelAgent(e.target.value)}
                                fullWidth
                            >
                                {agents.map((a) => (
                                    <MenuItem key={a.idAgent} value={a.idAgent}>
                                        {a.nom} {a.prenom}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    )}

                    {type === TYPE_MOUVEMENT.DEPLACEMENT && (
                        <TextField
                            label="Motif"
                            placeholder="Raison du mouvement..."
                            value={motif}
                            onChange={(e) => setMotif(e.target.value)}
                            multiline
                            minRows={2}
                        />
                    )}

                    <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                        <Button onClick={onFermer} sx={{ bgcolor: '#dc5e60', color: '#fff', textTransform: 'none', '&:hover': { bgcolor: '#c84f51' } }}>
                            Annuler
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleEnregistrer}
                            disabled={envoi}
                            sx={{ bgcolor: '#1b7548', textTransform: 'none', '&:hover': { bgcolor: '#145d39' } }}
                        >
                            {envoi ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}