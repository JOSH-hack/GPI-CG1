/*

Nom du fichier   : Liste.jsx
Objectif         : Page Gestion des agents - liste filtrable/recherchable, affichage du compte utilisateur lie le cas echeant. Contenu seul (Sidebar/Navbar fournis par DashboardLayout)
Propriétaire     : Josué BEDEL
Date de création : 03/09/2026

*/

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
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
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import { agentApi } from '../../api/agentApi'
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/constants'
import backgroundPic from '../../assets/background/backgroundpic.png'

const columns = [
  { label: 'ID', width: '6%' },
  { label: 'Nom', width: '14%' },
  { label: 'Prénom', width: '14%' },
  { label: 'Fonction', width: '16%' },
  { label: 'Téléphone', width: '13%' },
  { label: 'Compte utilisateur', width: '27%' },
  { label: '', width: '10%' },
]

function formaterDate(dateIso) {
  if (!dateIso) return '—'
  return new Date(dateIso).toLocaleDateString('fr-FR')
}

const controlSx = {
  '& .MuiOutlinedInput-root': {
    height: 34,
    borderRadius: '5px',
    fontFamily: 'Quicksand, sans-serif',
    fontSize: '13px',
  },
}

export default function Liste() {
  const navigate = useNavigate()

  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [filtreLien, setFiltreLien] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState('10')

  async function chargerAgents() {
    setLoading(true)
    setErreur('')
    try {
      const response = await agentApi.listerTous()
      setAgents(response.data)
    } catch {
      setErreur('Impossible de charger la liste des agents.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerAgents()
  }, [])

  const agentsFiltres = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return agents.filter((agent) => {
      const matchLien =
        !filtreLien ||
        (filtreLien === 'lie' && agent.utilisateur) ||
        (filtreLien === 'non-lie' && !agent.utilisateur)

      const matchRecherche =
        !query ||
        [agent.idAgent, agent.nom, agent.prenom, agent.fonction, agent.telephone, agent.utilisateur?.email]
          .filter(Boolean)
          .some((valeur) => String(valeur).toLowerCase().includes(query))

      return matchLien && matchRecherche
    })
  }, [agents, searchQuery, filtreLien])

  const parPage = Number(rowsPerPage)
  const nombrePages = Math.max(1, Math.ceil(agentsFiltres.length / parPage))
  const pageActuelle = Math.min(page, nombrePages)
  const agentsAffiches = agentsFiltres.slice((pageActuelle - 1) * parPage, pageActuelle * parPage)

  return (
   <Box
         component="section"
         sx={{
           width: '100%',
           backgroundImage: `linear-gradient(
             rgba(204, 204, 204, 0.55),
             rgba(201, 201, 201, 0.75)
           ), url(${backgroundPic})`,
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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Typography sx={{ color: '#0c5d7d', fontSize: '24px', fontWeight: 700 }}>
          Liste des agents
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150, ...controlSx }}>
            <Select
              displayEmpty
              value={filtreLien}
              onChange={(event) => {
                setFiltreLien(event.target.value)
                setPage(1)
              }}
              renderValue={(value) =>
                value === 'lie' ? 'Avec compte' : value === 'non-lie' ? 'Sans compte' : 'Tous les agents'
              }
            >
              <MenuItem value="">Tous les agents</MenuItem>
              <MenuItem value="lie">Avec compte utilisateur</MenuItem>
              <MenuItem value="non-lie">Sans compte utilisateur</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Rechercher un agent..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setPage(1)
            }}
            sx={{ width: 200, ...controlSx }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/gestion/agents/nouveau')}
            sx={{ bgcolor: '#1b7548', textTransform: 'none', '&:hover': { bgcolor: '#145d39' } }}
          >
            Nouvel agent
          </Button>
        </Stack>
      </Stack>

      {erreur && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erreur}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ border: '2px solid #146f42', borderRadius: '9px' }}>
        <Table
          size="small"
          sx={{
            tableLayout: 'fixed',
            '& .MuiTableCell-root': { borderBottom: 'none', color: '#0c5d7d', fontFamily: 'Quicksand, sans-serif' },
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: '#0c5d7d', height: 46 }}>
              {columns.map((column) => (
                <TableCell
                  key={column.label || 'actions'}
                  sx={{ width: column.width, px: 1.5, color: '#fff !important', fontSize: '15px', fontWeight: 700 }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : agentsAffiches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4, fontSize: 15 }}>
                  Aucun agent trouvé.
                </TableCell>
              </TableRow>
            ) : (
              agentsAffiches.map((agent, index) => (
                <TableRow key={agent.idAgent} sx={{ height: 50, bgcolor: index % 2 === 0 ? '#fff' : '#f3f4f6' }}>
                  <TableCell sx={{ px: 1.5, fontSize: '15px', fontWeight: 600 }}>{agent.idAgent}</TableCell>
                  <TableCell sx={{ px: 1.5, fontSize: '15px' }}>{agent.nom}</TableCell>
                  <TableCell sx={{ px: 1.5, fontSize: '15px' }}>{agent.prenom}</TableCell>
                  <TableCell sx={{ px: 1.5, fontSize: '15px' }}>{agent.fonction || '—'}</TableCell>
                  <TableCell sx={{ px: 1.5, fontSize: '15px' }}>{agent.telephone || '—'}</TableCell>
                  <TableCell sx={{ px: 1.5 }}>
                    {agent.utilisateur ? (
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Chip
                          label={ROLE_LABELS[agent.utilisateur.role]}
                          size="small"
                          sx={{
                            bgcolor: ROLE_COLORS[agent.utilisateur.role],
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '12px',
                          }}
                        />
                        <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
                          {agent.utilisateur.email}
                        </Typography>
                      </Stack>
                    ) : (
                      <Chip
                        label="Aucun compte lié"
                        size="small"
                        sx={{ bgcolor: '#9CA3AF', color: '#fff', fontSize: '12px' }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      onClick={() => navigate(`/gestion/agents/${agent.idAgent}`)}
                      sx={{ color: '#0c5d7d', textTransform: 'none', fontSize: '13px' }}
                    >
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mt: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography sx={{ color: '#0c5d7d', fontSize: '14px' }}>Lignes affichées</Typography>
          <FormControl size="small" sx={{ minWidth: 60, ...controlSx }}>
            <Select
              value={rowsPerPage}
              onChange={(event) => {
                setRowsPerPage(event.target.value)
                setPage(1)
              }}
            >
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="20">20</MenuItem>
              <MenuItem value="50">50</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Button
            variant="outlined"
            disabled={pageActuelle === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            sx={{ fontSize: '12px', textTransform: 'none' }}
          >
            Précédent
          </Button>
          {Array.from({ length: nombrePages }, (_, i) => i + 1).map((numeroPage) => (
            <Button
              key={numeroPage}
              variant={pageActuelle === numeroPage ? 'contained' : 'outlined'}
              onClick={() => setPage(numeroPage)}
              sx={{
                minWidth: 32,
                bgcolor: pageActuelle === numeroPage ? '#0c5d7d' : '#fff',
                color: pageActuelle === numeroPage ? '#fff' : '#0c5d7d',
                fontSize: '12px',
              }}
            >
              {numeroPage}
            </Button>
          ))}
          <Button
            variant="outlined"
            disabled={pageActuelle === nombrePages}
            onClick={() => setPage((current) => Math.min(nombrePages, current + 1))}
            sx={{ fontSize: '12px', textTransform: 'none' }}
          >
            Suivant
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}