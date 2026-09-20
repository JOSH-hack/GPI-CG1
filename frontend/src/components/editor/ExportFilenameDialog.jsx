import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const ExportFilenameDialog = ({ open, format, nomParDefaut, onClose, onConfirm }) => {
    const [nomFichier, setNomFichier] = useState(nomParDefaut);

    useEffect(() => {
        if (open) {
            setNomFichier(nomParDefaut);
        }
    }, [open, nomParDefaut]);

    const nomValide = nomFichier.trim().length > 0;

    const confirmer = () => {
        if (!nomValide) return;
        onConfirm(nomFichier.trim());
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontFamily: "Quicksand, sans-serif", fontWeight: 700, fontSize: 17 }}>
                Nom du fichier à exporter
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: "#5c7078", mb: 1.5 }}>
                    Ce nom sera utilisé pour le fichier téléchargé sur votre appareil.
                </Typography>
                <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    label="Nom du fichier"
                    value={nomFichier}
                    onChange={(event) => setNomFichier(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") confirmer();
                    }}
                    error={!nomValide}
                    helperText={nomValide ? " " : "Le nom du fichier ne peut pas être vide."}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">.{format}</InputAdornment>,
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ fontSize: 13, fontWeight: 600, textTransform: "none", color: "#5c7078" }}>
                    Annuler
                </Button>
                <Button
                    variant="contained"
                    disabled={!nomValide}
                    onClick={confirmer}
                    sx={{ bgcolor: "#146f42", fontSize: 13, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#0f5732" } }}
                >
                    Exporter
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportFilenameDialog;
export { ExportFilenameDialog };