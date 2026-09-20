import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { TYPE_CATEGORIE } from "../../utils/constants";
import { EditableChip } from "./EditableChip";

function buildRows(typeCategorie) {
  if (typeCategorie === TYPE_CATEGORIE.HARDWARE) {
    return {
      title: "Équipement matériel",
      rows: [
        { label: "Processeur", key: "processeur" },
        { label: "Mémoire RAM", key: "ram" },
        { label: "Capacité disque", key: "capaciteDisque" },
        { label: "Adresse IP", key: "adresseIp" },
        { label: "Adresse MAC", key: "adresseMac" },
        { label: "Système d'exploitation", key: "systemeExploitation" },
      ],
    };
  }

  if (typeCategorie === TYPE_CATEGORIE.SOFTWARE) {
    return {
      title: "Équipement logiciel",
      rows: [
        { label: "Version", key: "version" },
        { label: "Nombre de licences", key: "nombreLicences" },
        { label: "Clé de licence", key: "cleLicence" },
        { label: "Date de début de licence", key: "dateDebutLicence" },
        { label: "Date d'expiration de licence", key: "dateExpirationLicence" },
      ],
    };
  }

  if (typeCategorie === TYPE_CATEGORIE.RESEAU) {
    return {
      title: "Équipement réseau",
      rows: [
        { label: "Type d'adresse", key: "typeAdresse" },
        { label: "Adresse IP", key: "adresseIp" },
        { label: "Adresse MAC", key: "adresseMac" },
        { label: "Passerelle", key: "passerelle" },
        { label: "Masque", key: "masqueSousReseau" },
        { label: "Nom d'hôte", key: "nomHote" },
      ],
    };
  }

  return { title: null, rows: [] };
}

const SpecificationSubTable = ({ title, rows, donneesEditees, onFieldChange }) => (
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
          {rows.map(({ label, key }, index) => (
            <TableRow
              key={key}
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
                <EditableChip
                  fieldKey={key}
                  value={donneesEditees?.[key] ?? ""}
                  onFieldChange={onFieldChange}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Stack>
);

const EquipmentSpecificationsSection = ({ typeCategorie, donneesEditees = {}, onFieldChange }) => {
  const { title, rows } = buildRows(typeCategorie);

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
        <SpecificationSubTable
          title={title}
          rows={rows}
          donneesEditees={donneesEditees}
          onFieldChange={onFieldChange}
        />
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