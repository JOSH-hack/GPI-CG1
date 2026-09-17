import re

service_file = "./backend/src/main/java/com/golfe1/gpi/services/DocumentDocx4jService.java"
with open(service_file, "r") as f:
    content = f.read()

# Ajout des imports nécessaires
new_imports = """import java.util.HashMap;
import java.util.Map;
import org.docx4j.model.datastorage.migration.VariablePrepare;"""
if "import java.util.Map;" not in content:
    content = content.replace("import java.util.List;", "import java.util.List;\n" + new_imports)

# Logique de remplacement
replacement_logic = """
            // Préparer le document pour le remplacement des variables
            VariablePrepare.prepare(wordMLPackage);
            
            // Créer le mapping des variables
            Map<String, String> mappings = new HashMap<>();
            mappings.put("$codeInventaire", equipement.getCodeInventaire() != null ? equipement.getCodeInventaire() : "");
            mappings.put("$nom", equipement.getNom() != null ? equipement.getNom() : "");
            mappings.put("$marque", equipement.getMarque() != null ? equipement.getMarque() : "");
            mappings.put("$modele", equipement.getModele() != null ? equipement.getModele() : "");
            mappings.put("$numeroSerie", equipement.getNumeroSerie() != null ? equipement.getNumeroSerie() : "");
            mappings.put("$tagQr", equipement.getTagQr() != null ? equipement.getTagQr() : "");
            
            // Effectuer le remplacement
            mainDocumentPart.variableReplace(mappings);
"""

# Insertion dans genererFicheEquipement
if "// TODO: Implémenter la logique de modification du document avec docx4j" in content:
    content = content.replace("// TODO: Implémenter la logique de modification du document avec docx4j", replacement_logic)

with open(service_file, "w") as f:
    f.write(content)
