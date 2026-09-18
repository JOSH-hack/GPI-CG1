import { Box, Stack, Typography } from "@mui/material";
import logo from "../../assets/icons/logo.svg";

const mastheadTypo = {
  fontFamily: "Quicksand, sans-serif",
  fontSize: 9.5,
  fontWeight: 700,
  lineHeight: 1.35,
  color: "#1c2a30",
};

const EquipmentDocumentMastheadSection = () => (
  <Box
    component="section"
    aria-label="En-tête institutionnel"
    sx={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      columnGap: 2,
      pt: 1,
    }}
  >
    <Stack alignItems="flex-start" spacing={0.15} textAlign="center" pt={0.5}>
      <Typography sx={mastheadTypo}>
        MINISTERE DE L&apos;ADMINISTRATION
        <br />
        TERRITORIALE DE LA GOUVERNANCE
        <br />
        ET DES AFFAIRES COUTUMIERES
      </Typography>
      <Typography sx={{ ...mastheadTypo, fontWeight: 400, paddingLeft: 7.25 }}>--------------</Typography>
      <Typography sx={{ ...mastheadTypo, paddingLeft: 5.5 }}>REGION MARITIME</Typography>
      <Typography sx={{ ...mastheadTypo, fontWeight: 400, paddingLeft: 6.5 }}>------------------</Typography>
      <Typography sx={{ ...mastheadTypo, paddingLeft: 4.25 }}>PREFECTURE DU GOLFE</Typography>
      <Box component="img" src={logo} alt="Armoiries Commune du Golfe 1" sx={{ width: 40, height: 40, my: 0.25, left: 70, position: "relative" }} />
      <Typography sx={{ ...mastheadTypo, paddingLeft: 4.75 }}>COMMUNE DU GOLFE 1</Typography>
      <Typography sx={{ ...mastheadTypo, fontWeight: 400, paddingLeft: 7.25 }}>--------------</Typography>
      <Typography sx={{ ...mastheadTypo, paddingLeft: 1.25 }}>DIRECTION DE LA COMMUNICATION</Typography>
      <Typography sx={{ ...mastheadTypo, fontWeight: 400, paddingLeft: 6.5 }}>---------------------</Typography>
      <Typography sx={{ ...mastheadTypo, paddingLeft: 4.25 }}>CELLULE INFORMATIQUE</Typography>
    </Stack>

    <Stack alignItems="flex-end" spacing={0.15} textAlign="center" pt={0.5}>
      <Typography sx={{ ...mastheadTypo, fontSize: 12, fontWeight: 400, paddingRight: -4, fontFamily: "'Quicksand, sans-serif'" }}>
        REPUBLIQUE TOGOLAISE
      </Typography>
      <Typography sx={{ ...mastheadTypo, fontSize: 10.5, fontWeight: 700, paddingRight: 1.85, fontFamily: "'Quicksand, sans-serif'" }}>
        Travail- Liberté – Patrie
      </Typography>
    </Stack>
  </Box>
);

export default EquipmentDocumentMastheadSection;
export { EquipmentDocumentMastheadSection };