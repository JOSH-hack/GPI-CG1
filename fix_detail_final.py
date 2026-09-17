import re
file_path = "frontend/src/pages/equipements/Detail.jsx"
with open(file_path, "r") as f:
    content = f.read()

# Extraire le Dialog
match = re.search(r'(<Dialog.*?</Dialog>)', content, re.DOTALL)
if match:
    dialog_code = match.group(1)
    content_without_dialog = content.replace(dialog_code, "")
    
    # Plus robuste : insérer avant le dernier return ou avant la fin de la fonction
    # Je vais chercher le bloc de fin et insérer avant
    new_content = content_without_dialog.replace("</Box>\n    </>\n  )\n}", "</Box>\n    </>\n" + dialog_code + "\n  )\n}")
    
    with open(file_path, "w") as f:
        f.write(new_content)
