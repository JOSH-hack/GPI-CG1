import { useEffect, useState } from 'react'
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material'

import { useAgents } from '../../contexts/AgentContext'
import { categorieApi } from '../../api/categorieApi'
import { localisationApi } from '../../api/localisationApi'
import { agentApi } from '../../api/agentApi'
import { equipementApi } from '../../api/equipementApi'
import {
    ANNEXES,
    ANNEXE_LABELS,
    STATUT_EQUIPEMENT,
    STATUT_EQUIPEMENT_LABELS,
    TYPE_CATEGORIE,
    TYPE_ADRESSE_RESEAU,
    TYPE_ADRESSE_RESEAU_LABELS,
} from '../../utils/constants'

const dialogPaperSx = {
    border: '10px solid #16834d',
    borderRadius: '14px',
    width: '100%',
    maxWidth: 480,
}

const champSx = {
    '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#f4f4f4' },
}

function CarteWizard({ titre, children }) {
    return (
        <Box>
            <Typography sx={{ color: 'text.secondary', fontWeight: 600, mb: 2 }}>{titre}</Typography>
            <Stack spacing={2}>{children}</Stack>
        </Box>
    )
}

export default function AjouterEquipementWizard({ open, onClose, onCree }) {
    const [etape, setEtape] = useState(1)
    const [erreur, setErreur] = useState('')
    const [enregistrement, setEnregistrement] = useState(false)

    const [categories, setCategories] = useState([])
    const { agents: agentsExistants, refreshAgents } = useAgents()

    // Etape 1
    const [infosGenerales, setInfosGenerales] = useState({
        idCategorie: '',
        codeInventaire: '',
        marque: '',
        modele: '',
        numeroSerie: '',
        dateAcquisition: '',
        finGarantie: '',
        statut: STATUT_EQUIPEMENT.EN_STOCK,
        coutAcquisition: '',
    })

    // Etape 2
    const [localisation, setLocalisation] = useState({ annexe: '', service: '', bureau: '', poste: '' })

    // Etape 3
    const [agentExistantChoisi, setAgentExistantChoisi] = useState(null)
    const [nouvelAgent, setNouvelAgent] = useState({ nom: '', prenom: '', fonction: '', telephone: '', email: '' })
    const [agentPasse, setAgentPasse] = useState(false)

    // Etape 4 (selon le type de categorie choisie a l'etape 1)
    const [champsMateriel, setChampsMateriel] = useState({
        processeur: '',
        ram: '',
        capaciteDisque: '',
        adresseIp: '',
        adresseMac: '',
        systemeExploitation: '',
    })
    const [champsLogiciel, setChampsLogiciel] = useState({
        version: '',
        editeur: '',
        nombreLicences: '',
        cleLicence: '',
        dateDebutLicence: '',
        dateExpirationLicence: '',
    })
    const [champsReseau, setChampsReseau] = useState({
        typeAdresse: '',
        adresseIp: '',
        masqueSousReseau: '',
        passerelle: '',
        dns: '',
        nomHote: '',
        nombrePorts: '',
    })

    useEffect(() => {
        if (!open) return
        categorieApi.listerToutes().then((res) => setCategories(res.data)).catch(() => setCategories([]))
        refreshAgents()
    }, [open, refreshAgents])

    function reinitialiser() {
        setEtape(1)
        setErreur('')
        setInfosGenerales({
            idCategorie: '',
            codeInventaire: '',
            marque: '',
            modele: '',
            numeroSerie: '',
            dateAcquisition: '',
            finGarantie: '',
            statut: STATUT_EQUIPEMENT.EN_STOCK,
            coutAcquisition: '',
        })
        setLocalisation({ annexe: '', service: '', bureau: '', poste: '' })
        setAgentExistantChoisi(null)
        setNouvelAgent({ nom: '', prenom: '', fonction: '', telephone: '', email: '' })
        setAgentPasse(false)
        setChampsMateriel({ processeur: '', ram: '', capaciteDisque: '', adresseIp: '', adresseMac: '', systemeExploitation: '' })
        setChampsLogiciel({ version: '', editeur: '', nombreLicences: '', cleLicence: '', dateDebutLicence: '', dateExpirationLicence: '' })
        setChampsReseau({ typeAdresse: '', adresseIp: '', masqueSousReseau: '', passerelle: '', dns: '', nomHote: '', nombrePorts: '' })
    }

    function fermer() {
        reinitialiser()
        onClose()
    }

    const categorieChoisie = categories.find((c) => c.idCategorie === Number(infosGenerales.idCategorie))

    // Etape 1 -> 2
    function handleSuivantInfosGenerales() {
        setErreur('')
        if (!infosGenerales.idCategorie || !infosGenerales.codeInventaire || !infosGenerales.dateAcquisition) {
            setErreur('Catégorie, code inventaire et date d\'acquisition sont obligatoires.')
            return
        }
        setEtape(2)
    }

    // Etape 2 -> 3 (cree la localisation immediatement)
    async function handleSuivantLocalisation() {
        setErreur('')
        if (!localisation.annexe || !localisation.service) {
            setErreur('Annexe et service sont obligatoires.')
            return
        }
        setEtape(3)
    }

    // Etape 3 -> 4
    function handleSuivantAgent() {
        setErreur('')
        if (!agentPasse && !agentExistantChoisi && !nouvelAgent.nom) {
            setErreur('Choisissez un agent existant, remplissez un nouvel agent, ou cliquez sur Passer.')
            return
        }
        setEtape(4)
    }

    // Etape 4 -> soumission finale
    async function handleTerminer() {
        setErreur('')
        setEnregistrement(true)

        try {
            // 1) Creer la localisation
            const resLocalisation = await localisationApi.creer({
                annexe: localisation.annexe,
                service: localisation.service,
                bureau: localisation.bureau || null,
                poste: localisation.poste || null,
            })
            const idLocalisation = resLocalisation.data.idLocalisation

            // 2) Determiner/creer l'agent (sauf si "Passer")
            let idAgent = null
            if (!agentPasse) {
                if (agentExistantChoisi) {
                    idAgent = agentExistantChoisi.idAgent
                } else {
                    const resAgent = await agentApi.creer({
                        nom: nouvelAgent.nom,
                        prenom: nouvelAgent.prenom,
                        fonction: nouvelAgent.fonction || null,
                        telephone: nouvelAgent.telephone || null,
                        email: nouvelAgent.email || null,
                        idUtilisateur: null,
                    })
                    idAgent = resAgent.data.idAgent
                    refreshAgents() // Rafraîchir le contexte après création
                }
            }

            // 3) Construire le payload commun
            const payloadCommun = {
                nom: infosGenerales.marque && infosGenerales.modele
                    ? `${infosGenerales.marque} ${infosGenerales.modele}`
                    : infosGenerales.codeInventaire,
                codeInventaire: infosGenerales.codeInventaire,
                numeroSerie: infosGenerales.numeroSerie || null,
                marque: infosGenerales.marque || null,
                modele: infosGenerales.modele || null,
                dateAcquisition: infosGenerales.dateAcquisition,
                finGarantie: infosGenerales.finGarantie || null,
                coutAcquisition: infosGenerales.coutAcquisition ? Number(infosGenerales.coutAcquisition) : null,
                statut: infosGenerales.statut,
                idCategorie: Number(infosGenerales.idCategorie),
                idLocalisation,
            }

            // 4) Creer l'equipement selon le type de categorie
            let resEquipement
            if (categorieChoisie?.type === TYPE_CATEGORIE.HARDWARE) {
                resEquipement = await equipementApi.creerMateriel({ ...payloadCommun, ...champsMateriel })
            } else if (categorieChoisie?.type === TYPE_CATEGORIE.SOFTWARE) {
                resEquipement = await equipementApi.creerLogiciel({
                    ...payloadCommun,
                    ...champsLogiciel,
                    nombreLicences: champsLogiciel.nombreLicences ? Number(champsLogiciel.nombreLicences) : null,
                })
            } else {
                resEquipement = await equipementApi.creerReseau({
                    ...payloadCommun,
                    ...champsReseau,
                    nombrePorts: champsReseau.nombrePorts ? Number(champsReseau.nombrePorts) : null,
                })
            }

            const idEquipementCree = resEquipement.data.idEquipement

            // 5) Affecter l'agent si choisi (l'affectation est ignoree a la creation, il faut l'action dediee)
            if (idAgent) {
                await equipementApi.affecterAgent(idEquipementCree, idAgent)
            }

            onCree(resEquipement.data)
            fermer()
        } catch (error) {
            setErreur(error.response?.data?.message || "Une erreur est survenue, veuillez réessayer")
        } finally {
            setEnregistrement(false)
        }
    }

    return (
        <Dialog open={open} onClose={fermer} slotProps={{ paper: { sx: dialogPaperSx } }}>
            <DialogContent>
                {erreur && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {erreur}
                    </Alert>
                )}

                {etape === 1 && (
                    <CarteWizard titre="Informations Générales sur l'équipement">
                        <FormControl fullWidth size="small" sx={champSx}>
                            <InputLabel>Catégorie</InputLabel>
                            <Select
                                label="Catégorie"
                                value={infosGenerales.idCategorie}
                                onChange={(e) => setInfosGenerales((p) => ({ ...p, idCategorie: e.target.value }))}
                            >
                                {categories.map((c) => (
                                    <MenuItem key={c.idCategorie} value={c.idCategorie}>
                                        {c.libelle}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Code Inventaire"
                            size="small"
                            sx={champSx}
                            value={infosGenerales.codeInventaire}
                            onChange={(e) => setInfosGenerales((p) => ({ ...p, codeInventaire: e.target.value }))}
                        />
                        <TextField
                            label="Marque"
                            size="small"
                            sx={champSx}
                            value={infosGenerales.marque}
                            onChange={(e) => setInfosGenerales((p) => ({ ...p, marque: e.target.value }))}
                        />
                        <TextField
                            label="Modèle"
                            size="small"
                            sx={champSx}
                            value={infosGenerales.modele}
                            onChange={(e) => setInfosGenerales((p) => ({ ...p, modele: e.target.value }))}
                        />
                        <TextField
                            label="Numéro de Série"
                            size="small"
                            sx={champSx}
                            value={infosGenerales.numeroSerie}
                            onChange={(e) => setInfosGenerales((p) => ({ ...p, numeroSerie: e.target.value }))}
                        />
                        <TextField
                            label="Date d'Acquisition"
                            type="date"
                            size="small"
                            sx={champSx}
                            InputLabelProps={{ shrink: true }}
                            value={infosGenerales.dateAcquisition}
                            onChange={(e) => setInfosGenerales((p) => ({ ...p, dateAcquisition: e.target.value }))}
                        />
                        <TextField
                            label="Fin de Garantie"
                            type="date"
                            size="small"
                            sx={champSx}
                            InputLabelProps={{ shrink: true }}
                            value={infosGenerales.finGarantie}
                            onChange={(e) => setInfosGenerales((p) => ({ ...p, finGarantie: e.target.value }))}
                        />
                        <FormControl fullWidth size="small" sx={champSx}>
                            <InputLabel>Statut</InputLabel>
                            <Select
                                label="Statut"
                                value={infosGenerales.statut}
                                onChange={(e) => setInfosGenerales((p) => ({ ...p, statut: e.target.value }))}
                            >
                                {Object.values(STATUT_EQUIPEMENT).map((s) => (
                                    <MenuItem key={s} value={s}>
                                        {STATUT_EQUIPEMENT_LABELS[s]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Coût d'Acquisition"
                            type="number"
                            size="small"
                            sx={champSx}
                            value={infosGenerales.coutAcquisition}
                            onChange={(e) => setInfosGenerales((p) => ({ ...p, coutAcquisition: e.target.value }))}
                        />
                        <Stack direction="row" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                onClick={handleSuivantInfosGenerales}
                                sx={{ bgcolor: '#146f42', '&:hover': { bgcolor: '#0f5a35' } }}
                            >
                                Suivant
                            </Button>
                        </Stack>
                    </CarteWizard>
                )}

                {etape === 2 && (
                    <CarteWizard titre="Informations sur la Localisation">
                        <FormControl fullWidth size="small" sx={champSx}>
                            <InputLabel>Annexe</InputLabel>
                            <Select
                                label="Annexe"
                                value={localisation.annexe}
                                onChange={(e) => setLocalisation((p) => ({ ...p, annexe: e.target.value }))}
                            >
                                {Object.values(ANNEXES).map((a) => (
                                    <MenuItem key={a} value={a}>
                                        {ANNEXE_LABELS[a]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Service"
                            size="small"
                            sx={champSx}
                            value={localisation.service}
                            onChange={(e) => setLocalisation((p) => ({ ...p, service: e.target.value }))}
                        />
                        <TextField
                            label="Bureau"
                            size="small"
                            sx={champSx}
                            value={localisation.bureau}
                            onChange={(e) => setLocalisation((p) => ({ ...p, bureau: e.target.value }))}
                        />
                        <TextField
                            label="Poste"
                            size="small"
                            sx={champSx}
                            value={localisation.poste}
                            onChange={(e) => setLocalisation((p) => ({ ...p, poste: e.target.value }))}
                        />
                        <Stack direction="row" justifyContent="space-between">
                            <Button onClick={() => setEtape(1)}>Précédent</Button>
                            <Button
                                variant="contained"
                                onClick={handleSuivantLocalisation}
                                sx={{ bgcolor: '#146f42', '&:hover': { bgcolor: '#0f5a35' } }}
                            >
                                Suivant
                            </Button>
                        </Stack>
                    </CarteWizard>
                )}

                {etape === 3 && (
                    <CarteWizard titre="Affectation à un agent">
                        <Autocomplete
                            options={agentsExistants}
                            value={agentExistantChoisi}
                            onChange={(_, valeur) => {
                                setAgentExistantChoisi(valeur)
                                if (valeur) setAgentPasse(false)
                            }}
                            getOptionLabel={(option) => `${option.nom} ${option.prenom}`}
                            isOptionEqualToValue={(option, value) => option.idAgent === value.idAgent}
                            renderInput={(params) => (
                                <TextField {...params} label="Rechercher un agent existant" size="small" sx={champSx} />
                            )}
                        />

                        <Typography align="center" sx={{ color: 'text.secondary', fontSize: 13 }}>
                            — ou créer un nouvel agent —
                        </Typography>

                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Nom"
                                size="small"
                                fullWidth
                                sx={champSx}
                                disabled={Boolean(agentExistantChoisi)}
                                value={nouvelAgent.nom}
                                onChange={(e) => setNouvelAgent((p) => ({ ...p, nom: e.target.value }))}
                            />
                            <TextField
                                label="Prénom"
                                size="small"
                                fullWidth
                                sx={champSx}
                                disabled={Boolean(agentExistantChoisi)}
                                value={nouvelAgent.prenom}
                                onChange={(e) => setNouvelAgent((p) => ({ ...p, prenom: e.target.value }))}
                            />
                        </Stack>
                        <TextField
                            label="Fonction"
                            size="small"
                            sx={champSx}
                            disabled={Boolean(agentExistantChoisi)}
                            value={nouvelAgent.fonction}
                            onChange={(e) => setNouvelAgent((p) => ({ ...p, fonction: e.target.value }))}
                        />
                        <TextField
                            label="Téléphone"
                            size="small"
                            sx={champSx}
                            disabled={Boolean(agentExistantChoisi)}
                            value={nouvelAgent.telephone}
                            onChange={(e) => setNouvelAgent((p) => ({ ...p, telephone: e.target.value }))}
                        />
                        <TextField
                            label="Email de contact"
                            size="small"
                            sx={champSx}
                            disabled={Boolean(agentExistantChoisi)}
                            helperText="Renseigne si l'agent n'a pas encore de compte utilisateur"
                            value={nouvelAgent.email}
                            onChange={(e) => setNouvelAgent((p) => ({ ...p, email: e.target.value }))}
                        />

                        <Stack direction="row" justifyContent="space-between">
                            <Button onClick={() => setEtape(2)}>Précédent</Button>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    onClick={() => {
                                        setAgentPasse(true)
                                        setEtape(4)
                                    }}
                                >
                                    Passer
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSuivantAgent}
                                    sx={{ bgcolor: '#146f42', '&:hover': { bgcolor: '#0f5a35' } }}
                                >
                                    Suivant
                                </Button>
                            </Stack>
                        </Stack>
                    </CarteWizard>
                )}
                {etape === 4 && (
                    <CarteWizard titre="Finalisation">
                        <Typography>Voulez-vous enregistrer cet équipement ?</Typography>
                        <Stack direction="row" justifyContent="space-between">
                            <Button onClick={() => setEtape(3)}>Précédent</Button>
                            <Button
                                variant="contained"
                                onClick={handleTerminer}
                                disabled={enregistrement}
                                sx={{ bgcolor: '#146f42', '&:hover': { bgcolor: '#0f5a35' } }}
                            >
                                {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>
                        </Stack>
                    </CarteWizard>
                )}
            </DialogContent>
        </Dialog>
    )
}
