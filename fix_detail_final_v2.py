import re

file_path = "frontend/src/pages/equipements/Detail.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Clean up duplicate buttons
# The button block has two occurrences. I will replace the whole Stack of buttons.
# Based on the file, the Stack containing buttons is:
# <Stack direction="row" spacing={1} className="no-print">
# ... buttons ...
# </Stack>

# I'll replace the whole button Stack with a cleaned version.
new_button_stack = """            <Stack direction="row" spacing={1} className="no-print">
              <Button
                variant="outlined"
                startIcon={<DescriptionOutlinedIcon />}
                onClick={() => setOpenEditor(true)}
              >
                Ouvrir l'éditeur
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PrintOutlined sx={{ fontSize: 14 }} />}
                onClick={() => window.print()}
                sx={{ ...typo, borderColor: '#146f42', color: '#146f42', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none' }}
              >
                Imprimer
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}
                onClick={async () => {
                  const response = await exportApi.telechargerFicheEquipementDocx(equipement.idEquipement);
                  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
                  const lien = document.createElement('a');
                  lien.href = url;
                  lien.download = `fiche-equipement-${equipement.idEquipement}.docx`;
                  document.body.appendChild(lien);
                  lien.click();
                  lien.remove();
                  window.URL.revokeObjectURL(url);
                }}
                sx={{ ...typo, bgcolor: '#0c5d7d', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#094a63' } }}
              >
                Télécharger DOCX
              </Button>
            </Stack>"""

# Using regex to match the old button stack
pattern = r'<Stack direction="row" spacing={1} className="no-print">.*?</Stack>'
content = re.sub(pattern, new_button_stack, content, flags=re.DOTALL)

# 2. Ensure Dialog is inside the main fragment <>
# I'll put it right after the </Box> and before the closing </>
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

# Remove existing Dialogs
content = re.sub(r'\s*<Dialog.*?</Dialog>', '', content, flags=re.DOTALL)

# Insert Dialog before the closing </>
content = content.replace("    </>\n\n  )", dialog_code + "\n    </>\n  )")

with open(file_path, "w") as f:
    f.write(content)
