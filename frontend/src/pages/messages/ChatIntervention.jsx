/*

Nom du fichier   : ChatIntervention.jsx
Objectif         : Chat temps reel d'une intervention a distance - historique
                    charge via REST, messages live via WebSocket (voir
                    useWebSocketChat)
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SendIcon from '@mui/icons-material/Send'
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { messageApi } from '../../api/messageApi'
import { interventionApi } from '../../api/interventionApi'
import { useWebSocketChat } from '../../hooks/useWebSocketChat'
import { useAuth } from '../../contexts/AuthContext'

function formaterHeure(valeur) {
  if (!valeur) return ''
  return new Date(valeur).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatIntervention() {
  const { idIntervention } = useParams()
  const { user } = useAuth()
  const [intervention, setIntervention] = useState(null)
  const [historique, setHistorique] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [saisie, setSaisie] = useState('')
  const finDeListeRef = useRef(null)

  const { messages, connecte, erreur: erreurWs, envoyerMessage } = useWebSocketChat(idIntervention)

  useEffect(() => {
    async function charger() {
      setChargement(true)
      setErreur('')
      try {
        const [resIntervention, resMessages] = await Promise.all([
          interventionApi.getParId(idIntervention),
          messageApi.listerParIntervention(idIntervention),
        ])
        setIntervention(resIntervention.data)
        setHistorique(resMessages.data)
      } catch {
        setErreur('Impossible de charger ce chat.')
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [idIntervention])

  const tousLesMessages = useMemo(() => {
    const idsHistorique = new Set(historique.map((m) => m.idMessage))
    const nouveaux = messages.filter((m) => !idsHistorique.has(m.idMessage))
    return [...historique, ...nouveaux]
  }, [historique, messages])

  useEffect(() => {
    finDeListeRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [tousLesMessages.length])

  function handleEnvoyer() {
    if (!saisie.trim()) return
    envoyerMessage(saisie)
    setSaisie('')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleEnvoyer()
    }
  }

  if (chargement) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (erreur || !intervention) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{erreur || 'Intervention introuvable.'}</Alert>
      </Box>
    )
  }

  const interlocuteur =
    user?.idUtilisateur === intervention.technicien?.idUtilisateur
      ? intervention.panne?.utilisateurSignaleur
      : intervention.technicien

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '80vh',
        width: '100%',
        maxWidth: 700,
        mx: 'auto',
        fontFamily: 'Quicksand, sans-serif',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2, borderBottom: '2px solid #146f42' }}>
        <IconButton component={RouterLink} to={`/assistance/interventions/ticket/${intervention.panne?.idPanne}`} size="small">
          <ArrowBackIcon sx={{ color: '#0c5d7d' }} />
        </IconButton>
        <Avatar sx={{ bgcolor: '#0c5d7d', width: 36, height: 36 }}>
          {interlocuteur?.nom?.[0] || '?'}
        </Avatar>
        <Box>
          <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 16 }}>
            {interlocuteur ? `${interlocuteur.nom} ${interlocuteur.prenom}` : 'Interlocuteur'}
          </Typography>
          <Typography sx={{ color: connecte ? '#1b7548' : '#9CA3AF', fontSize: 12, fontWeight: 600 }}>
            {connecte ? 'En ligne' : 'Connexion...'}
          </Typography>
        </Box>
      </Stack>

      {erreurWs && <Alert severity="warning" sx={{ mx: 2, mt: 1 }}>{erreurWs}</Alert>}

      <Stack spacing={1.5} sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {tousLesMessages.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>
            Aucun message pour l&apos;instant.
          </Typography>
        ) : (
          tousLesMessages.map((message) => {
            const estMoi = message.expediteur?.idUtilisateur === user?.idUtilisateur
            return (
              <Stack key={message.idMessage} alignItems={estMoi ? 'flex-end' : 'flex-start'}>
                <Paper
                  elevation={0}
                  sx={{
                    px: 1.5,
                    py: 1,
                    maxWidth: '75%',
                    borderRadius: 2,
                    bgcolor: estMoi ? '#0c5d7d' : '#f3f4f6',
                    color: estMoi ? '#fff' : '#1f2937',
                  }}
                >
                  <Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{message.contenu}</Typography>
                </Paper>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25 }}>
                  {formaterHeure(message.dateEnvoi)}
                </Typography>
              </Stack>
            )
          })
        )}
        <div ref={finDeListeRef} />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ p: 2, borderTop: '2px solid #146f42' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Écrivez votre message..."
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={handleKeyDown}
          multiline
          maxRows={4}
          disabled={!connecte}
        />
        <IconButton
          onClick={handleEnvoyer}
          disabled={!connecte || !saisie.trim()}
          sx={{ bgcolor: '#146f42', color: '#fff', '&:hover': { bgcolor: '#0f5a35' }, '&.Mui-disabled': { bgcolor: '#d1d5db' } }}
        >
          <SendIcon />
        </IconButton>
      </Stack>
    </Box>
  )
}