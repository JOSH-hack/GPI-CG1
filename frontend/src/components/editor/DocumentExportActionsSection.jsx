import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { ExportFilenameDialog } from "./ExportFilenameDialog";
import { construireNomFichierParDefaut } from "./documentValues";

// Le DOCX a ete abandonne pour l'editeur : seul le PDF (capture d'image,
// fidele au rendu ecran) est propose desormais - plus de choix de format.
const FORMAT_EXPORT = "pdf";

const DocumentExportActionsSection = ({
  pageCount = 2,
  lastEditedAt = "à l'instant",
  lastEditedBy = "Kontan A.",
  donneesEditees = {},
  exportEnCours = false,
  onCancel,
  onExport,
}) => {
  const [dialogueExportOuvert, setDialogueExportOuvert] = useState(false);

  const confirmerExport = (nomFichier) => {
    setDialogueExportOuvert(false);
    onExport?.(nomFichier);
  };

  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1.5,
        px: 3,
        py: 1.25,
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 11.5,
          color: "#5c7078",
          mr: "auto",
        }}
      >
        {pageCount} pages · Dernière modification {lastEditedAt} par {lastEditedBy}
      </Typography>

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button
          size="small"
          onClick={onCancel}
          disabled={exportEnCours}
          sx={{ fontSize: 12, fontWeight: 600, textTransform: "none", color: "#5c7078" }}
        >
          Annuler
        </Button>
        <Button
          size="small"
          variant="contained"
          disabled={exportEnCours}
          startIcon={
            exportEnCours ? (
              <CircularProgress size={14} sx={{ color: "common.white" }} />
            ) : (
              <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
            )
          }
          onClick={() => setDialogueExportOuvert(true)}
          sx={{
            bgcolor: "#146f42",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "#0f5732" },
          }}
        >
          {exportEnCours ? "Génération du PDF…" : "Exporter le document"}
        </Button>
      </Stack>

      <ExportFilenameDialog
        open={dialogueExportOuvert}
        format={FORMAT_EXPORT}
        nomParDefaut={construireNomFichierParDefaut(donneesEditees)}
        onClose={() => setDialogueExportOuvert(false)}
        onConfirm={confirmerExport}
      />
    </Box>
  );
};

export default DocumentExportActionsSection;
export { DocumentExportActionsSection };