import { useEffect, useRef, useState } from "react";
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
import { formaterDate, formaterMontant, valeurAffichee } from "./documentValues";
import { EquipmentSignatureSection } from "./EquipmentSignatureSection";
import { capturerPagesEditeur } from "./exportCapture";

// Hauteur utile d'une page A4 en px (~1122px à 96dpi pour 297mm),
// moins une estimation des marges d'impression haut/bas. C'est une
// approximation pour donner un nombre de pages indicatif à l'écran,
// et c'est aussi la hauteur de tranche utilisee pour decouper la
// capture d'ecran en pages lors de l'export (voir exportCapture.js).
const HAUTEUR_UTILE_PAGE_A4_PX = 1050;

// Construit l'état initial des données éditables à partir de l'équipement
// chargé depuis l'API. Les clés utilisées ici sont exactement celles qui
// seront envoyées au backend (ExportRequest.donneesEditees) au moment de
// l'export DOCX (voir Phase 3/4 du plan). Le PDF, lui, est desormais
// genere par capture d'image (voir exportCapture.js / DocumentExportActionsSection).
// Les valeurs sont déjà "formatées affichage" (dates, montants) pour que
// ce qui est édité corresponde exactement à ce qui est visible et exporté.
function buildDonneesInitiales(equipement) {
  if (!equipement) return {};

  const localisation = equipement.localisation ?? {};
  const agent = equipement.agent ?? {};

  return {
    // Informations générales
    codeInventaire: valeurAffichee(equipement.codeInventaire),
    nom: valeurAffichee(equipement.nom),
    numeroSerie: valeurAffichee(equipement.numeroSerie),
    marque: valeurAffichee(equipement.marque),
    modele: valeurAffichee(equipement.modele),
    dateAcquisition: formaterDate(equipement.dateAcquisition),
    finGarantie: formaterDate(equipement.finGarantie),
    coutAcquisition: formaterMontant(equipement.coutAcquisition),
    "categorie.libelle": valeurAffichee(equipement.categorie?.libelle),
    "categorie.type": valeurAffichee(equipement.categorie?.type),
    "localisation.annexe": valeurAffichee(localisation.annexe),
    "localisation.service": valeurAffichee(localisation.service),
    "localisation.bureau": valeurAffichee(localisation.bureau),
    "localisation.poste": valeurAffichee(localisation.poste),

    // Statut
    statut: equipement.statut ?? "",
    description: valeurAffichee(equipement.description),

    // Spécifications matériel / logiciel / réseau
    processeur: valeurAffichee(equipement.processeur),
    ram: valeurAffichee(equipement.ram),
    capaciteDisque: valeurAffichee(equipement.capaciteDisque),
    adresseIp: valeurAffichee(equipement.adresseIp),
    adresseMac: valeurAffichee(equipement.adresseMac),
    systemeExploitation: valeurAffichee(equipement.systemeExploitation),
    version: valeurAffichee(equipement.version),
    nombreLicences: valeurAffichee(equipement.nombreLicences),
    cleLicence: valeurAffichee(equipement.cleLicence),
    dateDebutLicence: formaterDate(equipement.dateDebutLicence),
    dateExpirationLicence: formaterDate(equipement.dateExpirationLicence),
    typeAdresse: valeurAffichee(equipement.typeAdresse),
    passerelle: valeurAffichee(equipement.passerelle),
    masqueSousReseau: valeurAffichee(equipement.masqueSousReseau),
    nomHote: valeurAffichee(equipement.nomHote),

    // Agent affecté
    "agent.idAgent": valeurAffichee(agent.idAgent),
    "agent.nom": valeurAffichee(agent.nom),
    "agent.prenom": valeurAffichee(agent.prenom),
    "agent.fonction": valeurAffichee(agent.fonction),
    "agent.telephone": valeurAffichee(agent.telephone),

    // En-tête institutionnel (fixe, mais éditable)
    "entete.ministere": "MINISTERE DE L'ADMINISTRATION\nTERRITORIALE DE LA GOUVERNANCE\nET DES AFFAIRES COUTUMIERES",
    "entete.region": "REGION MARITIME",
    "entete.prefecture": "PREFECTURE DU GOLFE",
    "entete.commune": "COMMUNE DU GOLFE 1",
    "entete.direction": "DIRECTION DE LA COMMUNICATION",
    "entete.cellule": "CELLULE INFORMATIQUE",
    "entete.republique": "REPUBLIQUE TOGOLAISE",
    "entete.devise": "Travail- Liberté – Patrie",

    // Pied de page
    "pied.mention": "Document généré par l'outil de gestion du parc informatique",
    "pied.adresse": "36 Avenue Bè-Pa de Souza. B.P. 62356 Tél. (228) 22 21 47 16 / 70 67 43 16",
    "pied.siteWeb": "www.golfe1.mairie.tg",
    "pied.email": "commulegofe1togo@gmail.com",

    // Signatures (grille 3 colonnes texte libre)
    "signature.titre1": "Nom",
    "signature.titre2": "Fonction",
    "signature.titre3": "Signature",
    "signature.valeur1": "",
    "signature.valeur2": "",
    "signature.valeur3": "",
  };
}

const EditorModal = ({ equipement, pannes = [], mouvements = [], onCancel, onExport }) => {
  const [donneesEditees, setDonneesEditees] = useState(() => buildDonneesInitiales(equipement));
  const [pageCount, setPageCount] = useState(1);
  const [exportEnCours, setExportEnCours] = useState(false);
  const articleRef = useRef(null);

  // Si l'éditeur est rouvert sur un autre équipement (changement d'id),
  // on repart d'un état initial propre plutôt que de garder les anciennes saisies.
  useEffect(() => {
    setDonneesEditees(buildDonneesInitiales(equipement));
  }, [equipement?.idEquipement]);

  // Recalcule le nombre de pages à chaque changement de taille du contenu
  // (édition de texte, ajout de spécifications selon la catégorie, etc.)
  useEffect(() => {
    const noeud = articleRef.current;
    if (!noeud) return undefined;

    const mettreAJourPageCount = () => {
      setPageCount(Math.max(1, Math.ceil(noeud.scrollHeight / HAUTEUR_UTILE_PAGE_A4_PX)));
    };

    mettreAJourPageCount();

    const observateur = new ResizeObserver(mettreAJourPageCount);
    observateur.observe(noeud);

    return () => observateur.disconnect();
  }, []);

  const handleFieldChange = (fieldKey, valeur) => {
    setDonneesEditees((precedent) => ({ ...precedent, [fieldKey]: valeur }));
  };

  // Capture le rendu reel de la fiche (pages images), puis delegue au
  // parent (Detail.jsx) l'envoi au backend + le telechargement. Le
  // parent reste responsable de fermer (ou non) la modale selon le
  // succes de l'operation.
  const handleExportConfirm = async (nomFichier) => {
    setExportEnCours(true);
    try {
      const images = await capturerPagesEditeur(articleRef.current, HAUTEUR_UTILE_PAGE_A4_PX);
      await onExport?.(images, nomFichier);
    } finally {
      setExportEnCours(false);
    }
  };

  return (
    <Paper
      component="main"
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 1180,
        height: "100%",
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        borderRadius: 3.5,
        bgcolor: "background.paper",
      }}
    >
      <DocumentEditorHeaderSection equipement={equipement} />
      <DocumentFormattingToolbarSection />
      <Box
        component="section"
        aria-label="Document editor"
        sx={{ flexGrow: 1, minHeight: 0, overflowY: "auto", bgcolor: "grey.50", px: { xs: 1, sm: 3 }, py: 3 }}
      >
        <Paper
          component="article"
          ref={articleRef}
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
            <EquipmentDocumentMastheadSection
              donneesEditees={donneesEditees}
              onFieldChange={handleFieldChange}
            />
            <Stack component="header" spacing={0.75} alignItems="center" pt={1.25}>
              <Typography
                component="h1"
                align="center"
                sx={{
                  color: "common.black",
                  fontFamily: "Quicksand, Helvetica, Arial, sans-serif",
                  fontSize: { xs: "1.25rem", sm: "2rem" },
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                FICHE DETAILLEE D&apos;EQUIPEMENT
              </Typography>
            </Stack>
            <EquipmentIdentifierQrSection equipement={equipement} />
            <GeneralEquipmentInformationSection
              donneesEditees={donneesEditees}
              onFieldChange={handleFieldChange}
            />
            <EquipmentStatusSection
              donneesEditees={donneesEditees}
              onFieldChange={handleFieldChange}
            />
            <EquipmentSpecificationsSection
              typeCategorie={equipement?.categorie?.type}
              donneesEditees={donneesEditees}
              onFieldChange={handleFieldChange}
            />
            <AssignedAgentInformationSection
              donneesEditees={donneesEditees}
              onFieldChange={handleFieldChange}
            />
            <EquipmentFailureHistorySection pannes={pannes} />
            <EquipmentMovementHistorySection mouvements={mouvements} />
            <EquipmentSignatureSection
              donneesEditees={donneesEditees}
              onFieldChange={handleFieldChange}
            />
            <DocumentLegalFooterSection
              donneesEditees={donneesEditees}
              onFieldChange={handleFieldChange}
            />
          </Stack>
        </Paper>
      </Box>
      <DocumentExportActionsSection
        pageCount={pageCount}
        donneesEditees={donneesEditees}
        exportEnCours={exportEnCours}
        onCancel={onCancel}
        onExport={handleExportConfirm}
      />
    </Paper>
  );
};

export default EditorModal;