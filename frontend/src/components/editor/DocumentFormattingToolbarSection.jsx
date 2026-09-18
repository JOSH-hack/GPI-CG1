import AddIcon from "@mui/icons-material/Add";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import RedoIcon from "@mui/icons-material/Redo";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import UndoIcon from "@mui/icons-material/Undo";
import { Box, Button, Divider, IconButton, MenuItem, Select, Stack } from "@mui/material";
import { useState } from "react";

const iconButtonSx = { color: "#5c7078", "&:hover": { bgcolor: "grey.100" } };

const ToolbarDivider = () => <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.75 }} />;

const DocumentFormattingToolbarSection = () => {
  const [police, setPolice] = useState("Lora");

  return (
    <Box
      component="div"
      role="toolbar"
      aria-label="Barre d'outils de mise en forme"
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 0.25,
        px: 2,
        py: 0.5,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "grey.50",
      }}
    >
      <IconButton size="small" sx={iconButtonSx} aria-label="Annuler">
        <UndoIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton size="small" sx={iconButtonSx} aria-label="Rétablir">
        <RedoIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <ToolbarDivider />

      <Select
        size="small"
        value={police}
        onChange={(event) => setPolice(event.target.value)}
        sx={{ height: 30, fontSize: 12, minWidth: 92 }}
      >
        <MenuItem value="Lora">Lora</MenuItem>
        <MenuItem value="Quicksand">Quicksand</MenuItem>
        <MenuItem value="Inter">Inter</MenuItem>
      </Select>

      <ToolbarDivider />

      <IconButton size="small" sx={iconButtonSx} aria-label="Gras">
        <FormatBoldIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton size="small" sx={iconButtonSx} aria-label="Italique">
        <FormatItalicIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton size="small" sx={iconButtonSx} aria-label="Souligné">
        <FormatUnderlinedIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <ToolbarDivider />

      <IconButton size="small" sx={iconButtonSx} aria-label="Aligner à gauche">
        <FormatAlignLeftIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton size="small" sx={iconButtonSx} aria-label="Centrer">
        <FormatAlignCenterIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton size="small" sx={iconButtonSx} aria-label="Justifier">
        <FormatAlignJustifyIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <ToolbarDivider />

      <IconButton size="small" sx={iconButtonSx} aria-label="Liste à puces">
        <FormatListBulletedIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton size="small" sx={iconButtonSx} aria-label="Liste numérotée">
        <FormatListNumberedIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <ToolbarDivider />

      <IconButton size="small" sx={iconButtonSx} aria-label="Insérer un lien">
        <InsertLinkIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton size="small" sx={iconButtonSx} aria-label="Insérer une image">
        <ImageOutlinedIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton size="small" sx={iconButtonSx} aria-label="Insérer un tableau">
        <TableChartOutlinedIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <Stack direction="row" sx={{ ml: "auto" }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: "#146f42",
            fontSize: 11.5,
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "#0f5732" },
          }}
        >
          Insérer un champ
        </Button>
      </Stack>
    </Box>
  );
};

export default DocumentFormattingToolbarSection;
export { DocumentFormattingToolbarSection };