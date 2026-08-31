/*

Nom du fichier   : ConfirmDialog.jsx
Objectif         : Boite de dialogue de confirmation generique et reutilisable (suppression, mise au rebut, validation d'action sensible)
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026

*/

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material'

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    confirmColor = 'error',
    onConfirm,
    onCancel,
    loading = false,
}) {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancel} disabled={loading}>
                    {cancelLabel}
                </Button>
                <Button
                    onClick={onConfirm}
                    color={confirmColor}
                    variant="contained"
                    disabled={loading}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    )
}