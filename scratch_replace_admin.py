import os

file_path = "js/admin.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace config
content = content.replace(
    "const GH_USER = 'Aritsiaserlet';\nconst GH_REPO = 'aritsiaserlet';\n\nconst API     = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents`;",
    "const GH_USER = 'OzonZ';\nconst GH_REPO = 'Non-Four-Portfolio-Data';\nconst DATA_PATH = 'All File Aritsia';\nconst API     = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${encodeURIComponent(DATA_PATH)}`;"
)

# Replace url strings
content = content.replace(
    "`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${fname}`",
    "`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${encodeURIComponent(DATA_PATH)}/${fname}`"
)
content = content.replace(
    "`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${mfname}`",
    "`https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${encodeURIComponent(DATA_PATH)}/${mfname}`"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated admin.js")
