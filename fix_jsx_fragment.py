import re
file_path = "frontend/src/pages/equipements/Detail.jsx"
with open(file_path, "r") as f:
    content = f.read()

# On cherche la structure actuelle :
# ...
#     </>
# <Dialog ... >
#   )
# }

# On veut :
# ...
#     </>
#     <Dialog ... >
#     </>
#   )
# }

# Je vais englober tout le return dans un seul fragment <> </> global si ce n'est pas déjà le cas
# Mais plus simplement, je vais déplacer le Dialog avant le </>.

# 1. Extraire le Dialog
match = re.search(r'(<Dialog.*?</Dialog>)', content, re.DOTALL)
if match:
    dialog_code = match.group(1)
    # Supprimer l'ancienne occurrence
    content_clean = content.replace(dialog_code, "")
    
    # Insérer le Dialog avant le </>, qui ferme le fragment
    # On cherche l'avant-dernière balise </>, en supposant qu'elle soit là pour fermer le fragment
    new_content = content_clean.replace("</>", "    " + dialog_code + "\n    </>")
    
    with open(file_path, "w") as f:
        f.write(new_content)
