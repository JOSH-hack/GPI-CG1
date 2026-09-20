import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import RedoIcon from "@mui/icons-material/Redo";
import UndoIcon from "@mui/icons-material/Undo";
import { Box, Divider, IconButton } from "@mui/material";

const iconButtonSx = { color: "#5c7078", "&:hover": { bgcolor: "grey.100" } };

const ToolbarDivider = () => <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.75 }} />;

// event.preventDefault() sur mousedown = on empêche le navigateur de retirer
// le focus (et donc la sélection) du champ contentEditable en cours d'édition
// avant que la commande de formatage ne s'applique.
function appliquerCommande(commande, valeur = null) {
  return (event) => {
    event.preventDefault();
    document.execCommand(commande, false, valeur);
  };
}

const DocumentFormattingToolbarSection = () => (
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
    <IconButton size="small" sx={iconButtonSx} aria-label="Annuler" onMouseDown={appliquerCommande("undo")}>
      <UndoIcon sx={{ fontSize: 18 }} />
    </IconButton>
    <IconButton size="small" sx={iconButtonSx} aria-label="Rétablir" onMouseDown={appliquerCommande("redo")}>
      <RedoIcon sx={{ fontSize: 18 }} />
    </IconButton>

    <ToolbarDivider />

    <IconButton size="small" sx={iconButtonSx} aria-label="Gras" onMouseDown={appliquerCommande("bold")}>
      <FormatBoldIcon sx={{ fontSize: 18 }} />
    </IconButton>
    <IconButton size="small" sx={iconButtonSx} aria-label="Italique" onMouseDown={appliquerCommande("italic")}>
      <FormatItalicIcon sx={{ fontSize: 18 }} />
    </IconButton>
    <IconButton size="small" sx={iconButtonSx} aria-label="Souligné" onMouseDown={appliquerCommande("underline")}>
      <FormatUnderlinedIcon sx={{ fontSize: 18 }} />
    </IconButton>

    <ToolbarDivider />

    <IconButton size="small" sx={iconButtonSx} aria-label="Aligner à gauche" onMouseDown={appliquerCommande("justifyLeft")}>
      <FormatAlignLeftIcon sx={{ fontSize: 18 }} />
    </IconButton>
    <IconButton size="small" sx={iconButtonSx} aria-label="Centrer" onMouseDown={appliquerCommande("justifyCenter")}>
      <FormatAlignCenterIcon sx={{ fontSize: 18 }} />
    </IconButton>
    <IconButton size="small" sx={iconButtonSx} aria-label="Justifier" onMouseDown={appliquerCommande("justifyFull")}>
      <FormatAlignJustifyIcon sx={{ fontSize: 18 }} />
    </IconButton>

    <ToolbarDivider />

    <IconButton size="small" sx={iconButtonSx} aria-label="Liste à puces" onMouseDown={appliquerCommande("insertUnorderedList")}>
      <FormatListBulletedIcon sx={{ fontSize: 18 }} />
    </IconButton>
    <IconButton size="small" sx={iconButtonSx} aria-label="Liste numérotée" onMouseDown={appliquerCommande("insertOrderedList")}>
      <FormatListNumberedIcon sx={{ fontSize: 18 }} />
    </IconButton>
  </Box>
);

export default DocumentFormattingToolbarSection;
export { DocumentFormattingToolbarSection };