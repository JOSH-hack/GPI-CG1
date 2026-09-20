/*
 *
 * Nom du fichier   : EditableChip.jsx
 *
 * Objectif         : Chip MUI dont la valeur est éditable en place
 *                    (contentEditable), utilisé par les sections de
 *                    l'éditeur de fiche équipement (EditorModal) pour
 *                    que le contenu affiché soit exactement celui
 *                    exporté (DOCX/PDF).
 *
 */

import { Chip } from "@mui/material";

const baseChipSx = {
    height: "auto",
    minHeight: 18,
    bgcolor: "#e0f5ee",
    borderRadius: 1,
    color: "#146f42",
    fontFamily: "Quicksand, Helvetica, Arial, sans-serif",
    fontSize: 14,
    fontWeight: 600,
    "& .MuiChip-label": {
        px: 0.75,
        whiteSpace: "normal",
        overflow: "visible",
        textOverflow: "unset",
    },
};

const editableSpanStyle = {
    outline: "none",
    cursor: "text",
    minWidth: 8,
    display: "inline-block",
};

// fieldKey : clé utilisée dans l'objet donneesEditees (ex: "nom", "localisation.annexe")
// value : valeur actuellement affichée/éditée
// onFieldChange(fieldKey, valeur) : remonte la nouvelle valeur au parent (EditorModal)
// readOnly : si vrai (ou si onFieldChange absent), le chip reste non éditable
const EditableChip = ({ fieldKey, value, onFieldChange, readOnly = false, sx }) => {
    if (readOnly || !onFieldChange) {
        return <Chip label={value} size="small" sx={{ ...baseChipSx, ...sx }} />;
    }

    const handleBlur = (event) => {
        const texte = event.currentTarget.innerText.trim();
        onFieldChange(fieldKey, texte);
    };

    const handleKeyDown = (event) => {
        // Empêche le saut de ligne : chaque champ reste une valeur sur une seule ligne
        if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
        }
    };

    return (
        <Chip
            size="small"
            sx={{ ...baseChipSx, ...sx }}
            label={
                <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    style={editableSpanStyle}
                >
                    {value}
                </span>
            }
        />
    );
};

export default EditableChip;
export { EditableChip };