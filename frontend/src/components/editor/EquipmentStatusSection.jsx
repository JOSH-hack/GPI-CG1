import {
  Box,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { STATUT_EQUIPEMENT_LABELS } from "../../utils/constants";
import { EditableChip } from "./EditableChip";

const selectSx = {
  height: 24,
  fontSize: 14,
  fontFamily: "Quicksand, Helvetica, Arial, sans-serif",
  fontWeight: 600,
  color: "#146f42",
  bgcolor: "#e0f5ee",
  "& .MuiSelect-select": { py: 0.25, px: 1 },
  "& fieldset": { border: "none" },
};

const EquipmentStatusSection = ({ donneesEditees = {}, onFieldChange }) => {
  const statutActuel = donneesEditees.statut ?? "";
  const observation = donneesEditees.description ?? "";

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
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell
                component="th"
                scope="row"
                sx={{ width: { xs: "42%", sm: 200 }, color: "#1c2a30", fontWeight: 700, whiteSpace: "nowrap" }}
              >
                Statut de l&apos;équipement
              </TableCell>
              <TableCell sx={{ borderLeft: 1, borderLeftColor: "divider" }}>
                <Select
                  size="small"
                  value={statutActuel}
                  onChange={(event) => onFieldChange?.("statut", event.target.value)}
                  displayEmpty
                  sx={selectSx}
                >
                  {statutActuel === "" && <MenuItem value="">—</MenuItem>}
                  {Object.entries(STATUT_EQUIPEMENT_LABELS).map(([valeur, libelle]) => (
                    <MenuItem key={valeur} value={valeur}>
                      {libelle}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: "common.white", "& .MuiTableCell-root": { borderBottom: 0 } }}>
              <TableCell
                component="th"
                scope="row"
                sx={{ width: { xs: "42%", sm: 200 }, color: "#1c2a30", fontWeight: 700, whiteSpace: "nowrap" }}
              >
                Observation
              </TableCell>
              <TableCell sx={{ borderLeft: 1, borderLeftColor: "divider" }}>
                <EditableChip fieldKey="description" value={observation} onFieldChange={onFieldChange} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EquipmentStatusSection;
export { EquipmentStatusSection };