import { Box, Stack, Typography } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { valeurAffichee } from "./documentValues";

const fieldTypo = {
  fontFamily: "Quicksand, sans-serif",
  fontSize: 14,
  fontWeight: 700,
  color: "#1c2a30",
};

const valueTypo = {
  fontFamily: "monospace",
  fontSize: 14,
  fontWeight: 600,
  color: "#146f42",
};

const EquipmentIdentifierQrSection = ({ equipement }) => (
  <Box
    component="section"
    aria-label="Identification de l'équipement"
    sx={{
      display: "grid",
      gridTemplateColumns: "1fr auto",
      alignItems: "center",
      gap: 2,
      pt: 1,
    }}
  >
    <Stack spacing={0.75}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography sx={fieldTypo}>Code inventaire :</Typography>
        <Typography sx={valueTypo}>{valeurAffichee(equipement?.codeInventaire)}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography sx={fieldTypo}>Tag QR :</Typography>
        <Typography sx={valueTypo}>{valeurAffichee(equipement?.tagQr)}</Typography>
      </Stack>
    </Stack>

    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={0.5}
      sx={{
        width: 96,
        height: 96,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 0.5,
      }}
    >
      {equipement?.codeInventaire ? (
        <QRCodeSVG value={equipement.codeInventaire} size={80} />
      ) : (
        <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#5c7078", fontWeight: 600 }}>
          QR CODE
        </Typography>
      )}
    </Stack>
  </Box>
);

export default EquipmentIdentifierQrSection;
export { EquipmentIdentifierQrSection };