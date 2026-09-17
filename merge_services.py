import re

docx_service_file = "./backend/src/main/java/com/golfe1/gpi/services/DocumentDocxService.java"
docx4j_service_file = "./backend/src/main/java/com/golfe1/gpi/services/DocumentDocx4jService.java"

with open(docx_service_file, "r") as f:
    content = f.read()

# Ajouter les imports manquants
imports_to_add = """
import java.util.HashMap;
import java.util.Map;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.model.datastorage.migration.VariablePrepare;
"""
if "import java.util.HashMap;" not in content:
    content = content.replace("import java.time.format.DateTimeFormatter;", "import java.time.format.DateTimeFormatter;" + imports_to_add)

# Préparation de la méthode de remplacement (à ajouter dans DocumentDocxService)
replacement_method = """
    private void remplacerVariables(XWPFDocument document, Equipement equipement) throws Exception {
        // Docx4j utilise WordprocessingMLPackage, alors que POI utilise XWPFDocument.
        // La logique actuelle utilise POI pour construire le document, mais Docx4j pour remplacer les variables.
        // C'est potentiellement incompatible si on utilise le même document.
        
        // Alternative : Utiliser POI pour faire le remplacement de texte
        for (XWPFParagraph p : document.getParagraphs()) {
            for (XWPFRun r : p.getRuns()) {
                String text = r.getText(0);
                if (text != null && text.contains("$")) {
                    text = text.replace("$codeInventaire", equipement.getCodeInventaire() != null ? equipement.getCodeInventaire() : "");
                    text = text.replace("$nom", equipement.getNom() != null ? equipement.getNom() : "");
                    text = text.replace("$marque", equipement.getMarque() != null ? equipement.getMarque() : "");
                    text = text.replace("$modele", equipement.getModele() != null ? equipement.getModele() : "");
                    text = text.replace("$numeroSerie", equipement.getNumeroSerie() != null ? equipement.getNumeroSerie() : "");
                    text = text.replace("$tagQr", equipement.getTagQr() != null ? equipement.getTagQr() : "");
                    r.setText(text, 0);
                }
            }
        }
        // Faire la même chose pour les tables si nécessaire
        for (XWPFTable tbl : document.getTables()) {
            for (XWPFTableRow row : tbl.getRows()) {
                for (XWPFTableCell cell : row.getTableCells()) {
                    for (XWPFParagraph p : cell.getParagraphs()) {
                        for (XWPFRun r : p.getRuns()) {
                            String text = r.getText(0);
                            if (text != null && text.contains("$")) {
                                text = text.replace("$codeInventaire", equipement.getCodeInventaire() != null ? equipement.getCodeInventaire() : "");
                                text = text.replace("$nom", equipement.getNom() != null ? equipement.getNom() : "");
                                text = text.replace("$marque", equipement.getMarque() != null ? equipement.getMarque() : "");
                                text = text.replace("$modele", equipement.getModele() != null ? equipement.getModele() : "");
                                text = text.replace("$numeroSerie", equipement.getNumeroSerie() != null ? equipement.getNumeroSerie() : "");
                                text = text.replace("$tagQr", equipement.getTagQr() != null ? equipement.getTagQr() : "");
                                r.setText(text, 0);
                            }
                        }
                    }
                }
            }
        }
    }
"""

# Ajouter la méthode avant la dernière accolade
content = content.strip().rstrip('}') + replacement_method + "\n}"

# Appel dans genererFicheEquipement
# On insère après nettoyerCorps
call_logic = "\n                        remplacerVariables(document, equipement);"
content = content.replace("nettoyerCorps(document);", "nettoyerCorps(document);" + call_logic)

with open(docx_service_file, "w") as f:
    f.write(content)
