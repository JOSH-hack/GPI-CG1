import re

file_path = "frontend/src/pages/equipements/Detail.jsx"
with open(file_path, "r") as f:
    content = f.read()

# Le dialogue doit être avant la fermeture de la fonction Detail
modal_code = """
      <Dialog
        open={openEditor}
        onClose={() => setOpenEditor(false)}
        maxWidth="lg"
        fullWidth
      >
        <EditorModal />
      </Dialog>
"""

# Insertion juste avant la dernière fermeture de la fonction (le tout dernier '}')
# On cherche le dernier '}'
match = re.search(r'^(.*)(\n})$', content, re.DOTALL)
if match:
    prefix = match.group(1)
    # Insérer avant le dernier '}'
    new_content = prefix + modal_code + "\n}"
    with open(file_path, "w") as f:
        f.write(new_content)
