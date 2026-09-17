import re

file_path = "frontend/src/pages/equipements/Detail.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Ajouter les imports en haut
new_imports = "import { Dialog } from '@mui/material';\nimport EditorModal from '../../components/editor/EditorModal';"
content = content.replace("import logo from '../../assets/icons/logo.svg'", "import logo from '../../assets/icons/logo.svg'\n" + new_imports)

# 2. Ajouter l'état 'openEditor' au début de Detail()
content = content.replace("export default function Detail() {", "export default function Detail() {\n  const [openEditor, setOpenEditor] = useState(false);")

# 3. Ajouter le bouton "Ouvrir l'éditeur" dans le Stack des boutons
button_code = """
              <Button
                variant="outlined"
                startIcon={<DescriptionOutlinedIcon />}
                onClick={() => setOpenEditor(true)}
                sx={{ ...typo, borderColor: '#0c5d7d', color: '#0c5d7d', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none' }}
              >
                Éditeur
              </Button>
"""
# On insère avant le bouton "Imprimer"
content = content.replace("<Button\n                size=\"small\"\n                variant=\"outlined\"", button_code + "\n              <Button\n                size=\"small\"\n                variant=\"outlined\"")

# 4. Ajouter le Dialog à la fin du return (avant le </>)
dialog_code = """
      <Dialog
        open={openEditor}
        onClose={() => setOpenEditor(false)}
        maxWidth="lg"
        fullWidth
      >
        <EditorModal />
      </Dialog>
"""
content = content.replace("    </>\n\n  )", dialog_code + "\n    </>\n  )")

with open(file_path, "w") as f:
    f.write(content)
