import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { STATUT_PANNE_LABELS } from "../../utils/constants";
import { formaterDate, valeurAffichee } from "./documentValues";

const columns = ["Date", "Description", "Statut", "Note de satisfaction"];

const chipSx = {
  height: "auto",
  minHeight: 18,
  bgcolor: "#e0f5ee",
  borderRadius: 1,
  color: "#146f42",
  fontFamily: "Quicksand, sans-serif",
  fontSize: 14,
  fontWeight: 600,
  "& .MuiChip-label": {
    px: 0.75,
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "unset",
  },
};

function buildRow(panne) {
  return [
    formaterDate(panne.dateSurvenance),
    valeurAffichee(panne.description),
    valeurAffichee(STATUT_PANNE_LABELS[panne.statut]),
    panne.noteSatisfaction != null ? `${panne.noteSatisfaction}/5` : "—",
  ];
}

const EquipmentFailureHistorySection = ({ pannes = [] }) => (
  <Box component="section" aria-labelledby="equipment-failure-history-title" sx={{ width: "100%" }}>
    <Box sx={{ height: 5, bgcolor: "common.black", mb: 0.75 }} />
    <Typography
      id="equipment-failure-history-title"
      component="h2"
      sx={{ mb: 0.5, color: "common.black", fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}
    >
      5. HISTORIQUE DES PANNES
    </Typography>
    <Typography sx={{ mb: 0.75, fontFamily: "Quicksand, sans-serif", fontSize: 14, fontStyle: "italic", color: "#5c7078" }}>
      Les lignes ci-dessous sont destinées aux enregistrements de l&apos;historique des pannes.
    </Typography>
    <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
      <Table
        size="small"
        aria-label="Historique des pannes"
        sx={{
          tableLayout: "fixed",
          "& .MuiTableCell-root": { borderColor: "divider", px: 1, py: 0.5, fontSize: 14, lineHeight: 1.2 },
        }}
      >
        <TableHead>
          <TableRow>
            {columns.map((label) => (
              <TableCell key={label} sx={{ bgcolor: "common.black", color: "common.white", fontWeight: 700, border: 0 }}>
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {pannes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ color: "#5c7078", fontStyle: "italic" }}>
                Aucune panne enregistrée.
              </TableCell>
            </TableRow>
          ) : (
            pannes.map((panne, rowIndex) => (
              <TableRow
                key={panne.idPanne ?? rowIndex}
                sx={{
                  bgcolor: rowIndex % 2 === 0 ? "grey.50" : "common.white",
                  "&:last-child .MuiTableCell-root": { borderBottom: 0 },
                }}
              >
                {buildRow(panne).map((value, index) => (
                  <TableCell key={columns[index]} sx={{ borderLeft: index === 0 ? 0 : 1, borderLeftColor: "divider" }}>
                    <Chip label={value} size="small" sx={chipSx} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export default EquipmentFailureHistorySection;
export { EquipmentFailureHistorySection };