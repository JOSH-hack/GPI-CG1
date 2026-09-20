import { Fragment } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { EditableChip } from "./EditableChip";

function buildRows() {
  return [
    [
      { label: "Code inventaire", key: "codeInventaire" },
      { label: "Nom / désignation", key: "nom" },
    ],
    [
      { label: "Numéro de série", key: "numeroSerie" },
      { label: "Marque", key: "marque" },
    ],
    [
      { label: "Modèle", key: "modele" },
      { label: "Date d'acquisition", key: "dateAcquisition" },
    ],
    [
      { label: "Fin de garantie", key: "finGarantie" },
      { label: "Coût d'acquisition", key: "coutAcquisition" },
    ],
    [
      { label: "Catégorie", key: "categorie.libelle", readOnly: true },
      { label: "Type de catégorie", key: "categorie.type", readOnly: true },
    ],
    [
      { label: "Localisation — Annexe", key: "localisation.annexe" },
      { label: "Localisation — Service", key: "localisation.service" },
    ],
    [
      { label: "Localisation — Bureau", key: "localisation.bureau" },
      { label: "Localisation — Poste", key: "localisation.poste" },
    ],
  ];
}

const GeneralEquipmentInformationSection = ({ donneesEditees = {}, onFieldChange }) => {
  const rows = buildRows();

  return (
    <Box component="section" aria-labelledby="general-equipment-information-title" sx={{ width: "100%" }}>
      <Box sx={{ height: 5, bgcolor: "common.black", mb: 0.75 }} />
      <Typography
        id="general-equipment-information-title"
        component="h2"
        sx={{ mb: 0.75, color: "common.black", fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}
      >
        1. INFORMATIONS GÉNÉRALES
      </Typography>
      <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
        <Table
          size="small"
          aria-label="Informations générales de l'équipement"
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
            {rows.map((pair, index) => (
              <TableRow
                key={pair[0].key}
                sx={{
                  bgcolor: index % 2 === 0 ? "grey.50" : "common.white",
                  "&:last-child .MuiTableCell-root": { borderBottom: 0 },
                }}
              >
                {pair.map(({ label, key, readOnly }, cellIndex) => (
                  <Fragment key={key}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        width: { xs: "28%", sm: 180 },
                        color: "#1c2a30",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        borderLeft: cellIndex === 1 ? 1 : 0,
                        borderLeftColor: "divider",
                      }}
                    >
                      {label}
                    </TableCell>
                    <TableCell sx={{ borderLeft: 1, borderLeftColor: "divider" }}>
                      <EditableChip
                        fieldKey={key}
                        value={donneesEditees[key] ?? ""}
                        onFieldChange={onFieldChange}
                        readOnly={readOnly}
                      />
                    </TableCell>
                  </Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GeneralEquipmentInformationSection;
export { GeneralEquipmentInformationSection };