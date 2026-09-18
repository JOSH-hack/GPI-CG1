import { Box, Stack, Typography } from "@mui/material";

const DocumentLegalFooterSection = () => (
  <Stack
    component="footer"
    spacing={0.5}
    alignItems="center"
    sx={{ pt: 2, mt: 1, borderTop: 1, borderColor: "divider" }}
  >
    <Typography
      sx={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, fontStyle: "italic", color: "#5c7078" }}
    >
      Document généré par l&apos;outil de gestion du parc informatique
    </Typography>
    <Box sx={{ height: 2, bgcolor: "common.black", width: "100%" }} />
    <Typography
      align="center"
      sx={{ fontFamily: "Inter, sans-serif", fontSize: 8.5, fontWeight: 700, color: "#1c2a30" }}
    >
      36 Avenue Bè-Pa de Souza. B.P. 62356 Tél. (228) 22 21 47 16 / 70 67 43 16 Web :{" "}
      <Box component="span" sx={{ color: "#0c5d7d", textDecoration: "underline" }}>
        www.golfe1.mairie.tg
      </Box>{" "}
      E-mail :{" "}
      <Box component="span" sx={{ color: "#0c5d7d", textDecoration: "underline" }}>
        commulegofe1togo@gmail.com
      </Box>
    </Typography>
  </Stack>
);

export default DocumentLegalFooterSection;
export { DocumentLegalFooterSection };