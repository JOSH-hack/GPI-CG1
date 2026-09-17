import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Box, Chip, Stack, Typography } from "@mui/material";

export const DocumentEditorHeaderSection = () => {
  return (
    <Box
      component="header"
      sx={{
        minHeight: 70,
        px: 3,
        py: 2,
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            bgcolor: "#146f42",
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            color: "common.white",
          }}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 21 }} />
        </Box>
        <Stack spacing={0.25}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              component="h1"
              sx={{
                color: "#1c2a30",
                fontFamily: "Quicksand, sans-serif",
                fontSize: 17,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Fiche détaillée d&apos;équipement
            </Typography>
            <Chip
              label="EDITABLE"
              size="small"
              sx={{
                height: 20,
                bgcolor: "#eef4f6",
                borderRadius: 1,
                color: "#0c5d7d",
                fontFamily: "Inter, sans-serif",
                fontSize: 10,
                fontWeight: 600,
                "& .MuiChip-label": {
                  px: 0.75,
                },
              }}
            />
          </Stack>
          <Typography
            component="p"
            sx={{
              m: 0,
              color: "#5c7078",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            GPI · Commune du Golfe 1 · Code inventaire INV-2025-00042 ·
            enregistré à l&apos;instant
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};
