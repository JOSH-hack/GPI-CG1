import { Box, Stack, Typography } from "@mui/material";
import { EditableText } from "./EditableText";

const colonnes = [
    { titreKey: "signature.titre1", valeurKey: "signature.valeur1" },
    { titreKey: "signature.titre2", valeurKey: "signature.valeur2" },
    { titreKey: "signature.titre3", valeurKey: "signature.valeur3" },
];

const titreTypo = {
    fontFamily: "Quicksand, sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: "#1c2a30",
};

const valeurTypo = {
    fontFamily: "Quicksand, sans-serif",
    fontSize: 14,
    fontWeight: 400,
    color: "#1c2a30",
    textDecoration: "underline",
};

const EquipmentSignatureSection = ({ donneesEditees = {}, onFieldChange }) => (
    <Box component="section" aria-labelledby="equipment-signature-title" sx={{ width: "100%" }}>
        <Box sx={{ height: 5, bgcolor: "common.black", mb: 0.75 }} />
        <Typography
            id="equipment-signature-title"
            component="h2"
            sx={{ mb: 1.5, color: "common.black", fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}
        >
            7. SIGNATURES
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", columnGap: 2, rowGap: 1 }}>
            {colonnes.map(({ titreKey, valeurKey }) => (
                <Stack key={titreKey} spacing={0.75} alignItems="flex-start">
                    <EditableText
                        fieldKey={titreKey}
                        value={donneesEditees[titreKey] ?? ""}
                        onFieldChange={onFieldChange}
                        component={Typography}
                        allowNewline={false}
                        sx={{ ...titreTypo, display: "block" }}
                    />
                    <EditableText
                        fieldKey={valeurKey}
                        value={donneesEditees[valeurKey] ?? ""}
                        onFieldChange={onFieldChange}
                        component={Typography}
                        allowNewline={false}
                        sx={{ ...valeurTypo, display: "block", minWidth: 100 }}
                    />
                </Stack>
            ))}
        </Box>
    </Box>
);

export default EquipmentSignatureSection;
export { EquipmentSignatureSection };