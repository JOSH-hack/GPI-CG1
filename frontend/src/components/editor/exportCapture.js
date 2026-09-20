/*

Nom du fichier   : exportCapture.js
Objectif         : Capture le rendu reel de l'editeur de fiche equipement
                    (contenu HTML/MUI tel qu'affiche a l'ecran) sous forme
                    d'images PNG, une par page A4, pour garantir un export
                    PDF visuellement identique a ce qui a ete edite -
                    plutot que de reconstruire le contenu champ par champ
                    cote backend (source d'ecarts de mise en forme).
Propriétaire     : Josué BEDEL
Date de création : 19/09/2026

*/

import html2canvas from "html2canvas";

// Resolution de capture : 2x la taille CSS reelle, pour un rendu net a
// l'impression (equivalent ~192dpi) sans faire exploser la taille du fichier.
const ECHELLE_CAPTURE = 2;

// Capture le noeud DOM fourni (le conteneur de la fiche dans EditorModal)
// et le decoupe en tranches d'exactement hauteurPagePx (en px CSS, la
// meme valeur que celle utilisee pour calculer pageCount) chacune - une
// tranche = une page A4 du PDF final.
//
// Retourne un tableau de data URLs PNG ("data:image/png;base64,....."),
// une par page, dans l'ordre.
export async function capturerPagesEditeur(noeud, hauteurPagePx) {
  if (!noeud) return [];

  const canvasComplet = await html2canvas(noeud, {
    scale: ECHELLE_CAPTURE,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const hauteurPageCapturePx = hauteurPagePx * ECHELLE_CAPTURE;
  const largeurCapture = canvasComplet.width;
  const nombrePages = Math.max(1, Math.ceil(canvasComplet.height / hauteurPageCapturePx));

  const images = [];

  for (let page = 0; page < nombrePages; page += 1) {
    const yDepart = page * hauteurPageCapturePx;
    const hauteurTranche = Math.min(hauteurPageCapturePx, canvasComplet.height - yDepart);

    const canvasPage = document.createElement("canvas");
    canvasPage.width = largeurCapture;
    canvasPage.height = hauteurTranche;

    const contexte = canvasPage.getContext("2d");
    // Fond blanc explicite : evite un fond transparent/noir selon les
    // moteurs PDF si jamais la derniere tranche est partielle.
    contexte.fillStyle = "#ffffff";
    contexte.fillRect(0, 0, canvasPage.width, canvasPage.height);
    contexte.drawImage(
      canvasComplet,
      0, yDepart, largeurCapture, hauteurTranche,
      0, 0, largeurCapture, hauteurTranche
    );

    images.push(canvasPage.toDataURL("image/png"));
  }

  return images;
}