import re

file_path = "frontend/src/pages/equipements/Detail.jsx"
with open(file_path, "r") as f:
    content = f.read()

# Add imports
new_imports = """
import { Dialog } from '@mui/material';
import EditorModal from '../../components/editor/EditorModal';
"""
if "import EditorModal" not in content:
    content = content.replace("import logo from '../../assets/icons/logo.svg'", "import logo from '../../assets/icons/logo.svg'" + new_imports)

# Add state
if "const [openEditor, setOpenEditor] = useState(false);" not in content:
    content = content.replace("const [", "const [openEditor, setOpenEditor] = useState(false);\n  const [")

# Add button
button_code = """
        <Button
          variant="outlined"
          startIcon={<DescriptionOutlinedIcon />}
          onClick={() => setOpenEditor(true)}
          sx={{ ml: 1 }}
        >
          Ouvrir l'éditeur
        </Button>
"""
# Find a good place for the button (after existing buttons)
content = content.replace("<Button", button_code + "\n        <Button")

# Add Modal
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
# Add at end of return block
content = content.rstrip('\n') + "\n" + modal_code + "\n}"

with open(file_path, "w") as f:
    f.write(content)
