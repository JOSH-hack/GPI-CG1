/*

Nom du fichier   : PieceJointeViewer.jsx
Objectif         : Affichage d'une piece jointe de panne avec consommation explicite d'une vue (jamais automatique au montage, pour ne pas gaspiller les 3 vues disponibles sur un re-render accidentel), gere image/video/pdf, suppression manuelle par le technicien
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026

*/

import { useState, useEffect, useRef } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    CircularProgress,
    Alert,
    Chip,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import ImageIcon from '@mui/icons-material/Image'
import VideocamIcon from '@mui/icons-material/Videocam'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import axiosClient from '../../api/axiosClient'
import { pieceJointeApi } from '../../api/pieceJointeApi'
import { useAuth } from '../../contexts/AuthContext'
import { TYPE_PIECE_JOINTE, ROLES } from '../../utils/constants'
import ConfirmDialog from '../common/ConfirmDialog'

const ICONES_TYPE = {
    [TYPE_PIECE_JOINTE.IMAGE]: ImageIcon,
    [TYPE_PIECE_JOINTE.VIDEO]: VideocamIcon,
    [TYPE_PIECE_JOINTE.PDF]: PictureAsPdfIcon,
}

export default function PieceJointeViewer({ pieceJointe, onDeleted }) {
    const { user } = useAuth()
    const [urlLocale, setUrlLocale] = useState(null)
    const [chargement, setChargement] = useState(false)
    const [erreur, setErreur] = useState('')
    const [dialogSuppression, setDialogSuppression] = useState(false)
    const urlRef = useRef(null)

    const peutSupprimer =
        user?.role === ROLES.TECHNICIEN || user?.role === ROLES.ADMIN_INFO || user?.role === ROLES.ADMIN_SYSTEME
    const estIndisponible =
        pieceJointe.supprimee || pieceJointe.supprimeeParTechnicien || pieceJointe.vuesRestantes <= 0

    // Nettoyage systematique de l'URL locale a la destruction du composant,
    // pour liberer la memoire (chaque blob reste sinon en RAM navigateur).
    useEffect(() => {
        return () => {
            if (urlRef.current) URL.revokeObjectURL(urlRef.current)
        }
    }, [])

    async function chargerFichier() {
        setErreur('')
        setChargement(true)

        try {
            const response = await axiosClient.get(
                `/pieces-jointes/${pieceJointe.idPieceJointe}/stream`,
                { responseType: 'blob' }
            )
            const url = URL.createObjectURL(response.data)
            urlRef.current = url
            setUrlLocale(url)
        } catch {
            setErreur("Cette piece jointe n'est plus accessible (expiree ou vues epuisees).")
        } finally {
            setChargement(false)
        }
    }

    async function handleSupprimer() {
        try {
            await pieceJointeApi.supprimer(pieceJointe.idPieceJointe)
            setDialogSuppression(false)
            onDeleted?.(pieceJointe.idPieceJointe)
        } catch {
            setErreur('Echec de la suppression.')
            setDialogSuppression(false)
        }
    }

    const Icone = ICONES_TYPE[pieceJointe.typeFichier] || ImageIcon

    return (
        <Card variant="outlined" sx={{ mb: 1 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icone color="action" />
                        <Typography variant="body2" color="text.secondary">
                            {pieceJointe.typeFichier}
                        </Typography>
                        {!estIndisponible && (
                            <Chip
                                size="small"
                                label={`${pieceJointe.vuesRestantes} vue(s) restante(s)`}
                                color={pieceJointe.vuesRestantes === 1 ? 'warning' : 'default'}
                            />
                        )}
                    </Box>

                    {peutSupprimer && !estIndisponible && (
                        <IconButton size="small" color="error" onClick={() => setDialogSuppression(true)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>

                {estIndisponible && (
                    <Alert severity="info">Cette piece jointe n&apos;est plus disponible.</Alert>
                )}

                {!estIndisponible && !urlLocale && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={chargement ? <CircularProgress size={16} /> : <VisibilityIcon />}
                        onClick={chargerFichier}
                        disabled={chargement}
                    >
                        Voir le fichier (consomme une vue)
                    </Button>
                )}

                {erreur && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                        {erreur}
                    </Alert>
                )}

                {urlLocale && pieceJointe.typeFichier === TYPE_PIECE_JOINTE.IMAGE && (
                    <Box
                        component="img"
                        src={urlLocale}
                        alt="Piece jointe"
                        sx={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 1, mt: 1 }}
                    />
                )}

                {urlLocale && pieceJointe.typeFichier === TYPE_PIECE_JOINTE.VIDEO && (
                    <Box
                        component="video"
                        src={urlLocale}
                        controls
                        sx={{ width: '100%', maxHeight: 400, borderRadius: 1, mt: 1 }}
                    />
                )}

                {urlLocale && pieceJointe.typeFichier === TYPE_PIECE_JOINTE.PDF && (
                    <Box
                        component="iframe"
                        src={urlLocale}
                        sx={{ width: '100%', height: 500, border: 'none', borderRadius: 1, mt: 1 }}
                    />
                )}
            </CardContent>

            <ConfirmDialog
                open={dialogSuppression}
                title="Supprimer la piece jointe"
                message="Cette action est definitive. Le fichier sera supprime du serveur."
                confirmLabel="Supprimer"
                confirmColor="error"
                onConfirm={handleSupprimer}
                onCancel={() => setDialogSuppression(false)}
            />
        </Card>
    )
}