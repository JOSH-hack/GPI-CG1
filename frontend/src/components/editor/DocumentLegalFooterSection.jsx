import { Box, Stack, Typography } from "@mui/material";
import { EditableText } from "./EditableText";

const DocumentLegalFooterSection = ({ donneesEditees = {}, onFieldChange }) => (
  <Stack
    component="footer"
    spacing={0.5}
    alignItems="center"
    sx={{ pt: 2, mt: 1, borderTop: 1, borderColor: "divider" }}
  >
    <EditableText
      fieldKey="pied.mention"
      value={donneesEditees["pied.mention"] ?? ""}
      onFieldChange={onFieldChange}
      component={Typography}
      allowNewline={false}
      sx={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, fontStyle: "italic", color: "#5c7078" }}
    />
    <Box sx={{ height: 2, bgcolor: "common.black", width: "100%" }} />
    <Typography
      align="center"
      sx={{ fontFamily: "Inter, sans-serif", fontSize: 8.5, fontWeight: 700, color: "#1c2a30" }}
    >
      <EditableText
        fieldKey="pied.adresse"
        value={donneesEditees["pied.adresse"] ?? ""}
        onFieldChange={onFieldChange}
        allowNewline={false}
      />{" "}
      Web :{" "}
      <EditableText
        fieldKey="pied.siteWeb"
        value={donneesEditees["pied.siteWeb"] ?? ""}
        onFieldChange={onFieldChange}
        allowNewline={false}
        sx={{ color: "#0c5d7d", textDecoration: "underline" }}
      />{" "}
      E-mail :{" "}
      <EditableText
        fieldKey="pied.email"
        value={donneesEditees["pied.email"] ?? ""}
        onFieldChange={onFieldChange}
        allowNewline={false}
        sx={{ color: "#0c5d7d", textDecoration: "underline" }}
      />
    </Typography>
  </Stack>
);

export default DocumentLegalFooterSection;
export { DocumentLegalFooterSection };