file_path = "frontend/src/pages/equipements/Detail.jsx"
with open(file_path, "r") as f:
    lines = f.readlines()

new_lines = []
found_open_editor = False
for line in lines:
    if "const [openEditor, setOpenEditor] = useState(false);" in line:
        if not found_open_editor:
            new_lines.append(line)
            found_open_editor = True
        # Sinon, on ignore les autres déclarations
    else:
        new_lines.append(line)

with open(file_path, "w") as f:
    f.writelines(new_lines)
