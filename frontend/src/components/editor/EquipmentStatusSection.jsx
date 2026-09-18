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
import { STATUT_EQUIPEMENT_LABELS } from "../../utils/constants";
import { valeurAffichee } from "./documentValues";

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

const EquipmentStatusSection = ({ equipement }) => {
  const rows = [
    { label: "Statut de l'équipement", value: valeurAffichee(STATUT_EQUIPEMENT_LABELS[equipement?.statut]) },
    // Le DTO backend n'expose pas de champ "observation" : on utilise "description" (le champ réellement disponible sur EquipementResponse).
    { label: "Observation", value: valeurAffichee(equipement?.description) },
  ];

  return (
    <Box component="section" aria-labelledby="equipment-status-title" sx={{ width: "100%" }}>
      <Box sx={{ height: 5, bgcolor: "common.black", mb: 0.75 }} />
      <Typography
        id="equipment-status-title"
        component="h2"
        sx={{ mb: 0.75, color: "common.black", fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}
      >
        2. STATUT
      </Typography>
      <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
        <Table
          size="small"
          aria-label="Statut de l'équipement"
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
    </Box>
  );
};

export default EquipmentStatusSection;
export { EquipmentStatusSection };