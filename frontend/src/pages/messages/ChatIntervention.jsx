/*

Nom du fichier   : ChatIntervention.jsx
Objectif         : Chat temps reel d'une intervention a distance - fidele a la
                    maquette (carte a bordure verte, bulles alignees par role -
                    Technicien a gauche, Agent a droite). Historique charge via
                    REST, messages live via WebSocket (voir useWebSocketChat)
Propriétaire     : Josué BEDEL
Date de création : 05/09/2026

*/

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import SendIcon from '@mui/icons-material/Send'
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { messageApi } from '../../api/messageApi'
import { interventionApi } from '../../api/interventionApi'
import { useWebSocketChat } from '../../hooks/useWebSocketChat'

function formaterHeure(valeur) {
  if (!valeur) return ''
  return new Date(valeur).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatIntervention() {
  const { idIntervention } = useParams()
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

  const idTechnicien = intervention.technicien?.idUtilisateur

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, width: '100%', boxSizing: 'border-box', fontFamily: 'Quicksand, sans-serif' }}>
      <IconButton
        component={RouterLink}
        to={`/assistance/interventions/ticket/${intervention.panne?.idPanne}`}
        size="small"
        sx={{ mb: 1 }}
      >
        <ArrowBackIcon sx={{ color: '#0c5d7d' }} />
      </IconButton>

      <Box
        sx={{
          maxWidth: 640,
          mx: 'auto',
          border: '2px solid #146f42',
          borderRadius: '14px',
          overflow: 'hidden',
          bgcolor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          height: '75vh',
        }}
      >
        {/* En-tete */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.5, borderBottom: '2px solid #146f42' }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <ChatBubbleOutlineIcon sx={{ color: '#0c5d7d' }} />
            <Typography sx={{ color: '#0c5d7d', fontWeight: 700, fontSize: 17 }}>
              Chat - Intervention à distance
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.6}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: connecte ? '#1b7548' : '#9CA3AF',
              }}
            />
            <Typography sx={{ color: connecte ? '#1b7548' : '#9CA3AF', fontSize: 13, fontWeight: 600 }}>
              {connecte ? 'En ligne' : 'Connexion...'}
            </Typography>
          </Stack>
        </Stack>

        {erreurWs && <Alert severity="warning" sx={{ mx: 2, mt: 1 }}>{erreurWs}</Alert>}

        {/* Messages */}
        <Stack spacing={1.75} sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#fafafa' }}>
          {tousLesMessages.length === 0 ? (
            <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>
              Aucun message pour l&apos;instant.
            </Typography>
          ) : (
            tousLesMessages.map((message) => {
              const estTechnicien = message.expediteur?.idUtilisateur === idTechnicien
              const role = estTechnicien ? 'Technicien' : 'Agent'
              const initiale = estTechnicien ? 'T' : 'A'

              return (
                <Stack
                  key={message.idMessage}
                  direction="row"
                  justifyContent={estTechnicien ? 'flex-start' : 'flex-end'}
                  spacing={1}
                  alignItems="flex-end"
                >
                  {estTechnicien && (
                    <Avatar sx={{ bgcolor: '#0c5d7d', width: 30, height: 30, fontSize: 14 }}>{initiale}</Avatar>
                  )}
                  <Box sx={{ maxWidth: '70%' }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#0c5d7d',
                        textAlign: estTechnicien ? 'left' : 'right',
                        mb: 0.25,
                      }}
                    >
                      {role}
                    </Typography>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: estTechnicien ? '#fff' : '#e6f4ea',
                        border: estTechnicien ? '1px solid #e5e7eb' : 'none',
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: '#1f2937', whiteSpace: 'pre-wrap' }}>
                        {message.contenu}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25, textAlign: estTechnicien ? 'left' : 'right' }}
                    >
                      {formaterHeure(message.dateEnvoi)}
                    </Typography>
                  </Box>
                  {!estTechnicien && (
                    <Avatar sx={{ bgcolor: '#1b7548', width: 30, height: 30, fontSize: 14 }}>{initiale}</Avatar>
                  )}
                </Stack>
              )
            })
          )}
          <div ref={finDeListeRef} />
        </Stack>

        {/* Saisie */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1.5, borderTop: '2px solid #146f42' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Écrire un message..."
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!connecte}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '999px', bgcolor: '#f3f4f6' } }}
          />
          <IconButton
            onClick={handleEnvoyer}
            disabled={!connecte || !saisie.trim()}
            sx={{
              bgcolor: '#1b7548',
              color: '#fff',
              width: 40,
              height: 40,
              '&:hover': { bgcolor: '#145d39' },
              '&.Mui-disabled': { bgcolor: '#d1d5db' },
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  )
}