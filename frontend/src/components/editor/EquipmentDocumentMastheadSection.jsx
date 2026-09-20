import { Box, Stack, Typography } from "@mui/material";
import logo from "../../assets/icons/logo.svg";
import { EditableText } from "./EditableText";

const mastheadTypo = {
  fontFamily: "Quicksand, sans-serif",
  fontSize: 9.5,
  fontWeight: 700,
  lineHeight: 1.35,
  color: "#1c2a30",
};

const EquipmentDocumentMastheadSection = ({ donneesEditees = {}, onFieldChange }) => (
  <Box
    component="section"
    aria-label="En-tête institutionnel"
    sx={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      columnGap: 2,
      pt: 1,
    }}
  >
    <Stack alignItems="flex-start" spacing={0.15} textAlign="center" pt={0.5}>
      <EditableText
        fieldKey="entete.ministere"
        value={donneesEditees["entete.ministere"] ?? ""}
        onFieldChange={onFieldChange}
        component={Typography}
        sx={{ ...mastheadTypo, display: "block" }}
      />
      <Typography sx={{ ...mastheadTypo, fontWeight: 400, paddingLeft: 7.25 }}>--------------</Typography>
      <EditableText
        fieldKey="entete.region"
        value={donneesEditees["entete.region"] ?? ""}
        onFieldChange={onFieldChange}
        component={Typography}
        sx={{ ...mastheadTypo, paddingLeft: 5.5 }}
      />
      <Typography sx={{ ...mastheadTypo, fontWeight: 400, paddingLeft: 6.5 }}>------------------</Typography>
      <EditableText
        fieldKey="entete.prefecture"
        value={donneesEditees["entete.prefecture"] ?? ""}
        onFieldChange={onFieldChange}
        component={Typography}
        sx={{ ...mastheadTypo, paddingLeft: 4.25 }}
      />
      <Box component="img" src={logo} alt="Armoiries Commune du Golfe 1" sx={{ width: 40, height: 40, my: 0.25, left: 70, position: "relative" }} />
      <EditableText
        fieldKey="entete.commune"
        value={donneesEditees["entete.commune"] ?? ""}
        onFieldChange={onFieldChange}
        component={Typography}
        sx={{ ...mastheadTypo, paddingLeft: 4.75 }}
      />
      <Typography sx={{ ...mastheadTypo, fontWeight: 400, paddingLeft: 7.25 }}>--------------</Typography>
      <EditableText
        fieldKey="entete.direction"
        value={donneesEditees["entete.direction"] ?? ""}
        onFieldChange={onFieldChange}
        component={Typography}
        sx={{ ...mastheadTypo, paddingLeft: 1.25 }}
      />
      <Typography sx={{ ...mastheadTypo, fontWeight: 400, paddingLeft: 6.5 }}>---------------------</Typography>
      <EditableText
        fieldKey="entete.cellule"
        value={donneesEditees["entete.cellule"] ?? ""}
        onFieldChange={onFieldChange}
        component={Typography}
        sx={{ ...mastheadTypo, paddingLeft: 4.25 }}
      />
    </Stack>

    <Stack alignItems="flex-end" spacing={0.15} textAlign="center" pt={0.5}>
      <EditableText
        fieldKey="entete.republique"
        value={donneesEditees["entete.republique"] ?? ""}
        onFieldChange={onFieldChange}
        component={Typography}
        sx={{ ...mastheadTypo, fontSize: 12, fontWeight: 400, fontFamily: "'Quicksand, sans-serif'" }}
      />
      <EditableText
        fieldKey="entete.devise"
        value={donneesEditees["entete.devise"] ?? ""}
        onFieldChange={onFieldChange}
        component={Typography}
        sx={{ ...mastheadTypo, fontSize: 10.5, fontWeight: 700, paddingRight: 1.85, fontFamily: "'Quicksand, sans-serif'" }}
      />
    </Stack>
  </Box>
);

export default EquipmentDocumentMastheadSection;
export { EquipmentDocumentMastheadSection };