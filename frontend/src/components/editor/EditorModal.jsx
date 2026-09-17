import { Box, Paper, Stack, Typography } from "@mui/material";
import { AssignedAgentInformationSection } from "./AssignedAgentInformationSection";
import { DocumentEditorHeaderSection } from "./DocumentEditorHeaderSection";
import { DocumentExportActionsSection } from "./DocumentExportActionsSection";
import { DocumentFormattingToolbarSection } from "./DocumentFormattingToolbarSection";
import { DocumentLegalFooterSection } from "./DocumentLegalFooterSection";
import { EquipmentDocumentMastheadSection } from "./EquipmentDocumentMastheadSection";
import { EquipmentFailureHistorySection } from "./EquipmentFailureHistorySection";
import { EquipmentIdentifierQrSection } from "./EquipmentIdentifierQrSection";
import { EquipmentMovementHistorySection } from "./EquipmentMovementHistorySection";
import { EquipmentSpecificationsSection } from "./EquipmentSpecificationsSection";
import { EquipmentStatusSection } from "./EquipmentStatusSection";
import { GeneralEquipmentInformationSection } from "./GeneralEquipmentInformationSection";

const EditorModal = () => (
  <Paper
    component="main"
    elevation={0}
    sx={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: 1180,
      minHeight: "100%",
      overflow: "hidden",
      border: 1,
      borderColor: "divider",
      borderRadius: 3.5,
      bgcolor: "background.paper",
    }}
  >
    <DocumentEditorHeaderSection />
    <DocumentFormattingToolbarSection />
    <Box
      component="section"
      aria-label="Document editor"
      sx={{
        flexGrow: 1,
        bgcolor: "grey.50",
        px: { xs: 1, sm: 3 },
        py: 3,
      }}
    >
      <Paper
        component="article"
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 820,
          mx: "auto",
          px: { xs: 2, sm: 7.5 },
          pt: 0,
          pb: 5,
          border: 1,
          borderColor: "divider",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
        }}
      >
        <Stack spacing={2.5}>
          <EquipmentDocumentMastheadSection />
          <Stack
            component="header"
            spacing={0.75}
            alignItems="center"
            pt={1.25}
          >
            <Typography
              component="h1"
              align="center"
              sx={{
                color: "common.black",
                fontFamily: "Quicksand, Helvetica, Arial, sans-serif",
                fontSize: { xs: "1.25rem", sm: "1.875rem" },
                fontWeight: 700,
                textDecoration: "underline",
              }}
            >
              FICHE DÉTAILLÉE D&apos;ÉQUIPEMENT
            </Typography>
          </Stack>
          <EquipmentIdentifierQrSection />
          <GeneralEquipmentInformationSection />
          <EquipmentStatusSection />
          <EquipmentSpecificationsSection />
          <AssignedAgentInformationSection />
          <EquipmentFailureHistorySection />
          <EquipmentMovementHistorySection />
          <DocumentLegalFooterSection />
        </Stack>
      </Paper>
    </Box>
    <DocumentExportActionsSection />
  </Paper>
);

export default EditorModal;
