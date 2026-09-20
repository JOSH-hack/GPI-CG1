/*
 * Nom du fichier   : EditableText.jsx
 * Objectif         : Variante d'EditableChip sans l'habillage "Chip",
 *                    pour les textes libres (en-tête institutionnel,
 *                    pied de page) qui doivent rester éditables tout
 *                    en gardant leur mise en forme (Typography) d'origine.
 */

import { Box } from "@mui/material";

const editableStyle = {
    outline: "none",
    cursor: "text",
    whiteSpace: "pre-line",
    display: "inline-block",
    minWidth: 8,
};

// fieldKey : clé dans donneesEditees (ex: "entete.commune", "pied.email")
// value : valeur actuelle
// onFieldChange(fieldKey, valeur) : remonte la modification au parent
// component/sx : pour reprendre exactement le style Typography existant
// allowNewline : true par défaut (l'en-tête peut tenir sur plusieurs lignes)
const EditableText = ({
    fieldKey,
    value,
    onFieldChange,
    component = "span",
    sx,
    allowNewline = true,
    ...props
}) => {
    if (!onFieldChange) {
        return (
            <Box component={component} sx={sx} {...props}>
                {value}
            </Box>
        );
    }

    const handleBlur = (event) => {
        const texte = event.currentTarget.innerText.trim();
        onFieldChange(fieldKey, texte);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !allowNewline) {
            event.preventDefault();
            event.currentTarget.blur();
        }
    };

    return (
        <Box
            component={component}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            sx={{ ...editableStyle, ...sx }}
            {...props}
        >
            {value}
        </Box>
    );
};

export default EditableText;
export { EditableText };