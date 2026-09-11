/*

Nom du fichier   : Detail.jsx
Objectif         : Fiche detaillee d'un equipement - fidele a la maquette
                    Gestion_Page_Fiche_detaillee. Header remplace par le fil
                    d'ariane standard de l'app (deja fourni par Navbar/Sidebar
                    via DashboardLayout). Impression/telechargement PDF via
                    window.print() cible uniquement sur la fiche.
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import { useEffect, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import PrintOutlined from '@mui/icons-material/PrintOutlined'
import { exportApi } from '../../api/exportApi'
import QrCode2 from '@mui/icons-material/QrCode2'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { QRCodeSVG } from 'qrcode.react'
import logo from '../../assets/icons/logo.svg'

import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import { equipementApi } from '../../api/equipementApi'
import { panneApi } from '../../api/panneApi'
import { historiqueApi } from '../../api/historiqueApi'
import {
  STATUT_EQUIPEMENT,
  STATUT_EQUIPEMENT_LABELS,
  PRIORITE_PANNE_LABELS,
  STATUT_PANNE_LABELS,
  TYPE_MOUVEMENT_LABELS,
  TYPE_CATEGORIE,
} from '../../utils/constants'

const typo = { fontFamily: 'Quicksand, sans-serif' }

const cardSx = { borderRadius: 2, border: '1px solid #e7e7e7', boxShadow: '0 6px 18px -6px rgba(0,0,0,0.08)', p: { xs: 2, sm: 2.5 } }

const STATUTS_LEGENDE = [
  { statut: STATUT_EQUIPEMENT.EN_SERVICE, color: '#1b7548' },
  { statut: STATUT_EQUIPEMENT.EN_PANNE, color: '#dc5e60' },
  { statut: STATUT_EQUIPEMENT.EN_STOCK, color: '#ff6a00' },
  { statut: STATUT_EQUIPEMENT.MIS_AU_REBUT, color: '#000000' },
]

function formaterDate(valeur) {
  if (!valeur) return '—'
  return new Date(valeur).toLocaleDateString('fr-FR')
}

function SectionTitle({ children }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Typography component="h2" sx={{ ...typo, color: '#080808', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'underline', whiteSpace: 'nowrap' }}>
        {children}
      </Typography>
      <Divider flexItem sx={{ alignSelf: 'center', borderBottomWidth: 3, borderColor: '#0c5d7d' }} />
    </Stack>
  )
}

function InformationItem({ label, value }) {
  return (
    <Stack spacing={0.25}>
      <Typography component="dt" sx={{ ...typo, color: '#070707', fontSize: '0.85rem', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography component="dd" sx={{ ...typo, m: 0, color: 'rgba(112,108,108,0.91)', fontSize: '0.82rem', lineHeight: 1.3 }}>
        {value ?? '—'}
      </Typography>
    </Stack>
  )
}

function Note({ valeur }) {
  if (!valeur) return <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>—</Typography>
  return (
    <Stack direction="row" spacing={0.15}>
      {Array.from({ length: 5 }).map((_, index) =>
        index < valeur ? (
          <StarIcon key={index} sx={{ color: '#e6a817', fontSize: '0.95rem' }} />
        ) : (
          <StarBorderIcon key={index} sx={{ color: '#77792b', fontSize: '0.95rem' }} />
        )
      )}
    </Stack>
  )
}

function infosSpecifiques(equipement) {
  const type = equipement.categorie?.type
  if (type === TYPE_CATEGORIE.HARDWARE) {
    return [
      { label: 'Processeur :', value: equipement.processeur },
      { label: 'RAM :', value: equipement.ram },
      { label: 'Capacité Stockage :', value: equipement.capaciteDisque },
      { label: 'Adresse IP :', value: equipement.adresseIp },
      { label: 'Adresse MAC :', value: equipement.adresseMac },
      { label: "Système d'exploitation :", value: equipement.systemeExploitation },
    ]
  }
  if (type === TYPE_CATEGORIE.SOFTWARE) {
    return [
      { label: 'Version :', value: equipement.version },
      { label: 'Nombre de Licences :', value: equipement.nombreLicences },
      { label: 'Clé de Licence :', value: equipement.cleLicence },
      { label: 'Début de licence :', value: formaterDate(equipement.dateDebutLicence) },
      { label: 'Expiration Licence :', value: formaterDate(equipement.dateExpirationLicence) },
    ]
  }
  if (type === TYPE_CATEGORIE.RESEAU) {
    return [
      { label: "Type d'adresse :", value: equipement.typeAdresse },
      { label: 'Adresse IP :', value: equipement.adresseIp },
      { label: 'Adresse Mac :', value: equipement.adresseMac },
      { label: 'Passerelle :', value: equipement.passerelle },
      { label: 'Masque :', value: equipement.masqueSousReseau },
      { label: "Nom d'Hôte :", value: equipement.nomHote },
      { label: 'Nombre de ports :', value: equipement.nombrePorts },
    ]
  }
  return []
}

export default function Detail() {
  const { id } = useParams()
  const [equipement, setEquipement] = useState(null)
  const [pannes, setPannes] = useState([])
  const [mouvements, setMouvements] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    async function charger() {
      setChargement(true)
      setErreur('')
      try {
        const [resEquipement, resPannes, resMouvements] = await Promise.all([
          equipementApi.getParId(id),
          panneApi.parEquipement(id),
          historiqueApi.timelineParEquipement(id),
        ])
        setEquipement(resEquipement.data)
        setPannes(resPannes.data)
        setMouvements(resMouvements.data)
      } catch {
        setErreur("Impossible de charger la fiche de cet équipement.")
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [id])

  if (chargement) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!equipement) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{erreur || 'Équipement introuvable.'}</Alert>
      </Box>
    )
  }

  const localisationTexte = equipement.localisation
    ? [equipement.localisation.annexe, equipement.localisation.service, equipement.localisation.bureau, equipement.localisation.poste]
      .filter(Boolean)
      .join(' - ')
    : '—'

  const agentTexte = equipement.agent
    ? [equipement.agent.nom, equipement.agent.prenom, equipement.agent.fonction, equipement.agent.telephone].filter(Boolean).join(' - ')
    : 'Non affecté'

  const nomComplet = [equipement.marque, equipement.modele, equipement.nom].filter(Boolean).join(' ')

  return (
    <>
      {/* Astuce impression : n'imprime que #fiche-imprimable, masque le reste (sidebar/navbar) */}
      <style>{`
    @media print {
        @page { size: A4; margin: 10mm; }
        body * { visibility: hidden; }
        #fiche-imprimable, #fiche-imprimable * { visibility: visible; }
        #fiche-imprimable { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
        .print-only { display: flex !important; margin-bottom: 8px; }
        #fiche-imprimable { font-size: 0.72em; transform: scale(0.92); transform-origin: top left; }
        #fiche-imprimable .MuiPaper-root { padding: 8px !important; margin-bottom: 4px !important; }
        #fiche-imprimable table { font-size: 0.85em; }
    }
`}</style>

      <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', boxSizing: 'border-box' }} id="fiche-imprimable">
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            className="print-only"
            sx={{ display: 'none' }}
          >
            <Box component="img" src={logo} alt="GPI-CG1" sx={{ width: 28, height: 28 }} />
            <Typography sx={{ ...typo, fontSize: '1.1rem', fontWeight: 700, color: '#0c5d7d' }}>GPI-CG1</Typography>
          </Stack>

          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ ...typo, fontSize: '0.85rem' }} className="no-print">
            <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">
              Accueil
            </Link>
            <Link component={RouterLink} to="/parc/equipements" underline="hover" color="inherit">
              Parc
            </Link>
            <Typography sx={{ ...typo, color: '#0c5d7d', fontWeight: 600 }}>Fiche détaillée</Typography>
          </Breadcrumbs>

          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} flexWrap="wrap">
            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 200 }}>
              <Typography component="h1" sx={{ ...typo, color: '#0c5d7d', fontSize: { xs: '1.35rem', sm: '1.55rem' }, fontWeight: 700 }}>
                Fiche détaillée
              </Typography>
              <Divider sx={{ borderBottomWidth: 3, borderColor: '#0c5d7d' }} />
            </Stack>

            <Stack direction="row" spacing={1} className="no-print">
              <Button
                size="small"
                variant="outlined"
                startIcon={<PrintOutlined sx={{ fontSize: 14 }} />}
                onClick={() => window.print()}
                sx={{ ...typo, borderColor: '#146f42', color: '#146f42', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none' }}
              >
                Imprimer
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<PrintOutlined sx={{ fontSize: 14 }} />}
                onClick={() => exportApi.telechargerFicheEquipementPdf(equipement.idEquipement)}
                sx={{ ...typo, bgcolor: '#0c5d7d', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#094a63' } }}
              >
                Télécharger PDF
              </Button>
            </Stack>
          </Stack>

          <Paper variant="outlined" sx={cardSx}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '140px minmax(0,1fr) 170px' },
                gap: { xs: 2, md: 3 },
                alignItems: 'start',
              }}
            >
              <Stack alignItems="center" spacing={0.5} className="no-print">
<QRCodeSVG value={equipement.codeInventaire} size={106} />              </Stack>
              <Stack spacing={0.4}>
                <Typography sx={{ ...typo, color: '#0c5d7d', fontSize: '0.95rem', fontWeight: 600 }}>{equipement.codeInventaire}</Typography>
                <Typography sx={{ ...typo, color: '#000', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'underline' }}>
                  {equipement.nom}
                </Typography>
                <Typography sx={{ ...typo, color: 'rgba(112,108,108,0.91)', fontSize: '0.82rem' }}>{nomComplet}</Typography>
              </Stack>
              <Stack spacing={0.45}>
                <Typography sx={{ ...typo, color: '#000', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'underline' }}>Statut</Typography>
                {STATUTS_LEGENDE.map(({ statut, color }) => (
                  <Stack key={statut} direction="row" alignItems="center" spacing={0.75}>
                    <Box
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor: statut === equipement.statut ? color : '#d1d5db',
                      }}
                    />
                    <Typography
                      sx={{
                        ...typo,
                        fontSize: '0.78rem',
                        fontWeight: statut === equipement.statut ? 700 : 400,
                        color: statut === equipement.statut ? '#000' : '#9ca3af',
                      }}
                    >
                      {STATUT_EQUIPEMENT_LABELS[statut]}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={cardSx}>
            <Stack spacing={1.25}>
              <SectionTitle>Informations Générales</SectionTitle>
              <Box
                component="dl"
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0,1fr))' }, columnGap: 3, rowGap: 1.25, m: 0 }}
              >
                <InformationItem label="Numéro de Série :" value={equipement.numeroSerie} />
                <InformationItem label="Date d'acquisition :" value={formaterDate(equipement.dateAcquisition)} />
                <InformationItem label="Fin de Garantie :" value={formaterDate(equipement.finGarantie)} />
                <InformationItem
                  label="Coût d'acquisition :"
                  value={equipement.coutAcquisition != null ? `${equipement.coutAcquisition} FCFA` : '—'}
                />
                <InformationItem label="Catégorie :" value={equipement.categorie?.libelle} />
                <InformationItem label="Localisation :" value={localisationTexte} />
                <Box sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}>
                  <InformationItem label="Agent Affecté :" value={agentTexte} />
                </Box>
              </Box>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={cardSx}>
            <Stack spacing={1.25}>
              <SectionTitle>Informations Spécifiques</SectionTitle>
              <Box
                component="dl"
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0,1fr))' }, columnGap: 3, rowGap: 1.25, m: 0 }}
              >
                {infosSpecifiques(equipement).map((item) => (
                  <InformationItem key={item.label} {...item} />
                ))}
              </Box>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={cardSx}>
            <Stack spacing={1.25}>
              <SectionTitle>Historique des Pannes</SectionTitle>
              <TableContainer sx={{ border: '1px solid #e5e5e5', borderRadius: 1.5, overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 760 }}>
                  <TableHead>
                    <TableRow>
                      {['Date', 'Description', 'Priorité', 'Statut', 'Note de Satisfaction'].map((label) => (
                        <TableCell key={label} sx={{ ...typo, bgcolor: '#0c5d7d', color: '#fff', fontSize: '0.7rem', fontWeight: 600 }}>
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pannes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                          Aucune panne enregistrée.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pannes.map((panne, index) => (
                        <TableRow key={panne.idPanne} sx={{ bgcolor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                          <TableCell sx={{ ...typo, fontSize: '0.78rem' }}>{formaterDate(panne.dateSurvenance)}</TableCell>
                          <TableCell sx={{ ...typo, fontSize: '0.75rem', color: 'rgba(112,108,108,0.91)' }}>{panne.description}</TableCell>
                          <TableCell sx={{ ...typo, fontSize: '0.78rem' }}>{PRIORITE_PANNE_LABELS[panne.priorite]}</TableCell>
                          <TableCell sx={{ ...typo, fontSize: '0.78rem' }}>{STATUT_PANNE_LABELS[panne.statut]}</TableCell>
                          <TableCell>
                            <Note valeur={panne.noteSatisfaction} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={cardSx}>
            <Stack spacing={1.25}>
              <SectionTitle>Historique des Mouvements</SectionTitle>
              <TableContainer sx={{ border: '1px solid #e5e5e5', borderRadius: 1.5, overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      {['Type de Mouvement', 'Motif', 'Ancienne valeur', 'Nouvelle valeur', 'Opérateur', 'Date'].map((label) => (
                        <TableCell key={label} sx={{ ...typo, bgcolor: '#0c5d7d', color: '#fff', fontSize: '0.7rem', fontWeight: 600 }}>
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mouvements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                          Aucun mouvement enregistré.
                        </TableCell>
                      </TableRow>
                    ) : (
                      mouvements.map((mouvement, index) => (
                        <TableRow key={mouvement.idMouvement} sx={{ bgcolor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                          <TableCell sx={{ ...typo, fontSize: '0.78rem' }}>{TYPE_MOUVEMENT_LABELS[mouvement.typeMouvement]}</TableCell>
                          <TableCell sx={{ ...typo, fontSize: '0.75rem', color: 'rgba(112,108,108,0.91)' }}>{mouvement.motif}</TableCell>
                          <TableCell sx={{ ...typo, fontSize: '0.78rem' }}>{mouvement.ancienneValeur}</TableCell>
                          <TableCell sx={{ ...typo, fontSize: '0.78rem' }}>{mouvement.nouvelleValeur}</TableCell>
                          <TableCell sx={{ ...typo, fontSize: '0.78rem' }}>
                            {mouvement.operateur ? `${mouvement.operateur.nom} ${mouvement.operateur.prenom}` : '—'}
                          </TableCell>
                          <TableCell sx={{ ...typo, fontSize: '0.78rem' }}>{formaterDate(mouvement.dateMouvement)}</TableCell>
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
    </>
  )
}