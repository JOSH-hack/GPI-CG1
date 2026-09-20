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
    { label: "Identifiant agent", key: "agent.idAgent", readOnly: true },
    { label: "Nom", key: "agent.nom" },
    { label: "Prénom", key: "agent.prenom" },
    { label: "Fonction", key: "agent.fonction" },
    { label: "Téléphone", key: "agent.telephone" },
  ];
}

const AssignedAgentInformationSection = ({ donneesEditees = {}, onFieldChange }) => {
  const rows = buildRows();

  return (
    <Box
      component="section"
      aria-labelledby="assigned-agent-information-title"
      sx={{ width: "100%" }}
    >
      <Box sx={{ height: 5, bgcolor: "common.black", mb: 0.75 }} />
      <Typography
        id="assigned-agent-information-title"
        component="h2"
        sx={{ mb: 0.75, color: "common.black", fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}
      >
        4. INFORMATIONS SUR L&apos;AGENT AFFECTÉ
      </Typography>
      <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
        <Table
          size="small"
          aria-label="Informations sur l'agent affecté"
          sx={{
            tableLayout: "fixed",
            "& .MuiTableCell-root": { borderColor: "divider", px: 1, py: 0.5, fontSize: 14, lineHeight: 1.2 },
          }}
        >
          <TableBody>
            {rows.map(({ label, key, readOnly }, index) => (
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
                    value={donneesEditees[key] ?? ""}
                    onFieldChange={onFieldChange}
                    readOnly={readOnly}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AssignedAgentInformationSection;
export { AssignedAgentInformationSection };