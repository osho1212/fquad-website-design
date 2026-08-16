import re

file_path = "design/F.QUAD Website.dc.html"
with open(file_path, "r") as f:
    content = f.read()

# Replace any existing small border-radius inline styles (like 1px, 2px)
content = re.sub(r'border-radius:\s*\d+px', 'border-radius:8px', content)

# Inject a global rule for figures (image cards) and buttons just to be safe
radius_css = "\nfigure, button { border-radius: 8px !important; }\n"
content = content.replace('</style>', radius_css + '</style>')

with open(file_path, "w") as f:
    f.write(content)

print("Border radius updated.")
