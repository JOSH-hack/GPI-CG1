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

const agentInformation = [
  { label: "Identifiant agent", value: "$agent.idAgent" },
  { label: "Nom", value: "$agent.nom" },
  { label: "Prénom", value: "$agent.prenom" },
  { label: "Fonction", value: "$agent.fonction" },
  { label: "Téléphone", value: "$agent.telephone" },
];

export const AssignedAgentInformationSection = () => {
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
        sx={{
          mb: 0.75,
          color: "common.black",
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        4. INFORMATIONS SUR L&apos;AGENT AFFECTÉ
      </Typography>
      <TableContainer
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Table
          size="small"
          aria-label="Informations sur l'agent affecté"
          sx={{
            tableLayout: "fixed",
            "& .MuiTableCell-root": {
              borderColor: "divider",
              px: 1,
              py: 0.5,
              fontSize: 10,
              lineHeight: 1.2,
            },
          }}
        >
          <TableBody>
            {agentInformation.map(({ label, value }, index) => (
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
                  sx={{
                    width: { xs: "42%", sm: 200 },
                    color: "#1c2a30",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </TableCell>
                <TableCell sx={{ borderLeft: 1, borderLeftColor: "divider" }}>
                  <Chip
                    label={value}
                    size="small"
                    sx={{
                      height: 18,
                      bgcolor: "#e0f5ee",
                      borderRadius: 1,
                      color: "#146f42",
                      fontFamily: "monospace",
                      fontSize: 10,
                      fontWeight: 600,
                      "& .MuiChip-label": {
                        px: 0.75,
                      },
                    }}
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
