/*

Nom du fichier   : FileUpload.jsx
Objectif         : Zone de depot de fichier (glisser-deposer ou parcourir) pour les pieces jointes de panne, accepte images, videos (mp4, mov, avi jusqu'a 50 Mo) et PDF, detecte automatiquement le type pour l'API
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026

*/

import { useState, useRef } from 'react'
import { Box, Typography, Button, LinearProgress, Alert } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { pieceJointeApi } from '../../api/pieceJointeApi'
import { TYPE_PIECE_JOINTE } from '../../utils/constants'

const TAILLE_MAX_OCTETS = 50 * 1024 * 1024

const EXTENSIONS_ACCEPTEES = {
    image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
    video: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
    pdf: ['application/pdf'],
}

function determinerType(mimeType) {
    if (EXTENSIONS_ACCEPTEES.image.includes(mimeType)) return TYPE_PIECE_JOINTE.IMAGE
    if (EXTENSIONS_ACCEPTEES.video.includes(mimeType)) return TYPE_PIECE_JOINTE.VIDEO
    if (EXTENSIONS_ACCEPTEES.pdf.includes(mimeType)) return TYPE_PIECE_JOINTE.PDF
    return null
}

export default function FileUpload({ idPanne, onUploadSuccess }) {
    const [enTrain, setEnTrain] = useState(false)
    const [erreur, setErreur] = useState('')
    const [glisseActif, setGlisseActif] = useState(false)
    const inputRef = useRef(null)

    async function traiterFichier(file) {
        setErreur('')

        const typeFichier = determinerType(file.type)

        if (!typeFichier) {
            setErreur('Format non accepté. Utilisez une image, une vidéo (mp4, mov, avi) ou un PDF.')
            return
        }

        if (file.size > TAILLE_MAX_OCTETS) {
            setErreur('Le fichier dépasse la taille maximale autorisée (50 Mo).')
            return
        }

        setEnTrain(true)
        try {
            const response = await pieceJointeApi.upload(file, idPanne, typeFichier)
            onUploadSuccess(response.data)
        } catch {
            setErreur("Échec de l'envoi du fichier. Réessayez.")
        } finally {
            setEnTrain(false)
        }
    }

    function handleDrop(event) {
        event.preventDefault()
        setGlisseActif(false)
        const file = event.dataTransfer.files?.[0]
        if (file) traiterFichier(file)
    }

    function handleSelection(event) {
        const file = event.target.files?.[0]
        if (file) traiterFichier(file)
        event.target.value = ''
    }

    return (
        <Box>
            <Box
                onDragOver={(e) => {
                    e.preventDefault()
                    setGlisseActif(true)
                }}
                onDragLeave={() => setGlisseActif(false)}
                onDrop={handleDrop}
                sx={{
                    border: '2px dashed',
                    borderColor: glisseActif ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: glisseActif ? 'action.hover' : 'background.paper',
                    transition: 'all 0.2s',
                }}
            >
                <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Glissez une photo ou vidéo courte de la panne ici, ou
                </Typography>
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => inputRef.current?.click()}
                    disabled={enTrain}
                >
                    Parcourir
                </Button>
                <input
                    ref={inputRef}
                    type="file"
                    hidden
                    accept="image/*,video/mp4,video/quicktime,video/x-msvideo,application/pdf"
                    onChange={handleSelection}
                />
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                    PNG, JPG, MP4, MOV, AVI ou PDF de taille inférieure à 50 Mo
                </Typography>
            </Box>

            {enTrain && <LinearProgress sx={{ mt: 1 }} />}
            {erreur && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {erreur}
                </Alert>
            )}
        </Box>
    )
}