import { Fragment } from "react";
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { formaterDate, formaterMontant, valeurAffichee } from "./documentValues";

const chipSx = {
  height: 18,
  bgcolor: "#e0f5ee",
  borderRadius: 1,
  color: "#146f42",
  fontFamily: "Quicksand, Helvetica, Arial, sans-serif",
  fontSize: 14,
  fontWeight: 600,
  "& .MuiChip-label": { px: 0.75 },
};

function buildRows(equipement) {
  const localisation = equipement?.localisation ?? {};
  return [
    [
      { label: "Code inventaire", value: valeurAffichee(equipement?.codeInventaire) },
      { label: "Nom / désignation", value: valeurAffichee(equipement?.nom) },
    ],
    [
      { label: "Numéro de série", value: valeurAffichee(equipement?.numeroSerie) },
      { label: "Marque", value: valeurAffichee(equipement?.marque) },
    ],
    [
      { label: "Modèle", value: valeurAffichee(equipement?.modele) },
      { label: "Date d'acquisition", value: formaterDate(equipement?.dateAcquisition) },
    ],
    [
      { label: "Fin de garantie", value: formaterDate(equipement?.finGarantie) },
      { label: "Coût d'acquisition", value: formaterMontant(equipement?.coutAcquisition) },
    ],
    [
      { label: "Catégorie", value: valeurAffichee(equipement?.categorie?.libelle) },
      { label: "Type de catégorie", value: valeurAffichee(equipement?.categorie?.type) },
    ],
    [
      { label: "Localisation — Annexe", value: valeurAffichee(localisation.annexe) },
      { label: "Localisation — Service", value: valeurAffichee(localisation.service) },
    ],
    [
      { label: "Localisation — Bureau", value: valeurAffichee(localisation.bureau) },
      { label: "Localisation — Poste", value: valeurAffichee(localisation.poste) },
    ],
  ];
}

const GeneralEquipmentInformationSection = ({ equipement }) => {
  const rows = buildRows(equipement);

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
                key={pair[0].label}
                sx={{
                  bgcolor: index % 2 === 0 ? "grey.50" : "common.white",
                  "&:last-child .MuiTableCell-root": { borderBottom: 0 },
                }}
              >
                {pair.map(({ label, value }, cellIndex) => (
                  <Fragment key={label}>
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
                      <Chip label={value} size="small" sx={chipSx} />
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