import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { TYPE_CATEGORIE } from "../../utils/constants";
import { formaterDate, valeurAffichee } from "./documentValues";

const chipSx = {
  height: 18,
  bgcolor: "#e0f5ee",
  borderRadius: 1,
  color: "#146f42",
  fontFamily: "Quicksand, Helvetica, Arial, sans-serif",
  fontSize: 14 ,
  fontWeight: 600,
  "& .MuiChip-label": { px: 0.75 },
};

function buildRows(equipement) {
  const type = equipement?.categorie?.type;

  if (type === TYPE_CATEGORIE.HARDWARE) {
    return {
      title: "Équipement matériel",
      rows: [
        { label: "Processeur", value: valeurAffichee(equipement?.processeur) },
        { label: "Mémoire RAM", value: valeurAffichee(equipement?.ram) },
        { label: "Capacité disque", value: valeurAffichee(equipement?.capaciteDisque) },
        { label: "Adresse IP", value: valeurAffichee(equipement?.adresseIp) },
        { label: "Adresse MAC", value: valeurAffichee(equipement?.adresseMac) },
        { label: "Système d'exploitation", value: valeurAffichee(equipement?.systemeExploitation) },
      ],
    };
  }

  if (type === TYPE_CATEGORIE.SOFTWARE) {
    return {
      title: "Équipement logiciel",
      rows: [
        { label: "Version", value: valeurAffichee(equipement?.version) },
        { label: "Nombre de licences", value: valeurAffichee(equipement?.nombreLicences) },
        { label: "Clé de licence", value: valeurAffichee(equipement?.cleLicence) },
        { label: "Date de début de licence", value: formaterDate(equipement?.dateDebutLicence) },
        { label: "Date d'expiration de licence", value: formaterDate(equipement?.dateExpirationLicence) },
      ],
    };
  }

  if (type === TYPE_CATEGORIE.RESEAU) {
    return {
      title: "Équipement réseau",
      rows: [
        { label: "Type d'adresse", value: valeurAffichee(equipement?.typeAdresse) },
        { label: "Adresse IP", value: valeurAffichee(equipement?.adresseIp) },
        { label: "Adresse MAC", value: valeurAffichee(equipement?.adresseMac) },
        { label: "Passerelle", value: valeurAffichee(equipement?.passerelle) },
        { label: "Masque", value: valeurAffichee(equipement?.masqueSousReseau) },
        { label: "Nom d'hôte", value: valeurAffichee(equipement?.nomHote) },
      ],
    };
  }

  return { title: null, rows: [] };
}

const SpecificationSubTable = ({ title, rows }) => (
  <Stack spacing={0.5}>
    <Typography
      component="h3"
      sx={{ fontFamily: "Quicksand, sans-serif", fontSize: 14, fontWeight: 700, fontStyle: "italic", color: "#1c2a30" }}
    >
      {title}
    </Typography>
    <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
      <Table
        size="small"
        aria-label={title}
        sx={{
          tableLayout: "fixed",
          "& .MuiTableCell-root": {
            borderColor: "divider",
            px: 1,
            py: 0.5,
            fontSize: 14,
            lineHeight: 1.2,
          },
        }}
      >
        <TableBody>
          {rows.map(({ label, value }, index) => (
            <TableRow
              key={label}
              sx={{
                bgcolor: index % 2 === 0 ? "grey.50" : "common.white",
                "&:last-child .MuiTableCell-root": { borderBottom: 0 },
              }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ width: { xs: "42%", sm: 200 }, color: "#1c2a30", fontWeight: 700, whiteSpace: "nowrap" }}
              >
                {label}
              </TableCell>
              <TableCell sx={{ borderLeft: 1, borderLeftColor: "divider" }}>
                <Chip label={value} size="small" sx={chipSx} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Stack>
);

const EquipmentSpecificationsSection = ({ equipement }) => {
  const { title, rows } = buildRows(equipement);

  return (
    <Box component="section" aria-labelledby="equipment-specifications-title" sx={{ width: "100%" }}>
      <Box sx={{ height: 5, bgcolor: "common.black", mb: 0.75 }} />
      <Typography
        id="equipment-specifications-title"
        component="h2"
        sx={{ mb: 0.75, color: "common.black", fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}
      >
        3. INFORMATIONS SPÉCIFIQUES
      </Typography>
      {title ? (
        <SpecificationSubTable title={title} rows={rows} />
      ) : (
        <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#5c7078" }}>
          Aucune information spécifique pour cette catégorie d&apos;équipement.
        </Typography>
      )}
    </Box>
  );
};

export default EquipmentSpecificationsSection;
export { EquipmentSpecificationsSection };