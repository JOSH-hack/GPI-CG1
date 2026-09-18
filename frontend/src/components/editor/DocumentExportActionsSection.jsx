import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useState } from "react";

const DocumentExportActionsSection = ({
  pageCount = 2,
  lastEditedAt = "à l'instant",
  lastEditedBy = "Kontan A.",
  onCancel,
  onExport,
}) => {
  const [format, setFormat] = useState("docx");

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
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, fontWeight: 600, color: "#5c7078" }}>
          Format :
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={format}
          onChange={(_event, value) => value && setFormat(value)}
          sx={{ "& .MuiToggleButton-root": { fontSize: 11, textTransform: "none", px: 1.25, py: 0.25 } }}
        >
          <ToggleButton value="docx">DOCX</ToggleButton>
          <ToggleButton value="pdf">PDF</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 11.5,
          color: "#5c7078",
          mx: "auto",
          textAlign: "center",
        }}
      >
        {pageCount} pages · Dernière modification {lastEditedAt} par {lastEditedBy}
      </Typography>

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button
          size="small"
          onClick={onCancel}
          sx={{ fontSize: 12, fontWeight: 600, textTransform: "none", color: "#5c7078" }}
        >
          Annuler
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => onExport?.(format)}
          sx={{
            bgcolor: "#146f42",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "#0f5732" },
          }}
        >
          Exporter le document
        </Button>
      </Stack>
    </Box>
  );
};

export default DocumentExportActionsSection;
export { DocumentExportActionsSection };