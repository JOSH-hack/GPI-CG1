/*

Nom du fichier   : PieceJointesListe.jsx
Objectif         : Conteneur qui recupere les pieces jointes actives d'une panne et affiche la zone d'upload (si role autorise) suivie de la liste des PieceJointeViewer
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026

*/

import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { pieceJointeApi } from '../../api/pieceJointeApi'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../utils/constants'
import FileUpload from '../common/FileUpload'
import PieceJointeViewer from './PieceJointeViewer'

export default function PieceJointesListe({ idPanne }) {
    const { user } = useAuth()
    const [pieces, setPieces] = useState([])
    const [chargement, setChargement] = useState(true)
    const [erreur, setErreur] = useState('')

    const peutUploader =
        user?.role === ROLES.AGENT ||
        user?.role === ROLES.TECHNICIEN ||
        user?.role === ROLES.ADMIN_INFO

    const chargerPieces = useCallback(async () => {
        setChargement(true)
        setErreur('')
        try {
            const response = await pieceJointeApi.listerParPanne(idPanne)
            setPieces(response.data)
        } catch {
            setErreur('Impossible de charger les pieces jointes.')
        } finally {
            setChargement(false)
        }
    }, [idPanne])

    useEffect(() => {
        chargerPieces()
    }, [chargerPieces])

    function handleUploadSuccess(nouvellePiece) {
        setPieces((precedent) => [...precedent, nouvellePiece])
    }

    function handleDeleted(idSupprime) {
        setPieces((precedent) => precedent.filter((p) => p.idPieceJointe !== idSupprime))
    }

    return (
        <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Pieces jointes
            </Typography>

            {peutUploader && (
                <Box sx={{ mb: 2 }}>
                    <FileUpload idPanne={idPanne} onUploadSuccess={handleUploadSuccess} />
                </Box>
            )}

            {chargement && <CircularProgress size={24} />}

            {erreur && <Alert severity="error">{erreur}</Alert>}

            {!chargement && pieces.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                    Aucune piece jointe pour cette panne.
                </Typography>
            )}

            {pieces.map((piece) => (
                <PieceJointeViewer
                    key={piece.idPieceJointe}
                    pieceJointe={piece}
                    onDeleted={handleDeleted}
                />
            ))}
        </Box>
    )
}