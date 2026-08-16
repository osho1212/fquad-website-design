import re

file_path = "design/F.QUAD Website.dc.html"
with open(file_path, "r") as f:
    content = f.read()

# Base logic: user wants Black & White, with white text, meaning a pure dark mode.
# Backgrounds should become Black (#000000). Text/Borders should become White (#ffffff).
# Gold/Accent should become Silver (#c0c0c0).

# 1. Update global body
content = re.sub(r'body\{margin:0;background:#[a-f0-9]+;color:#[a-f0-9]+', 'body{margin:0;background:#000000;color:#ffffff', content)
content = re.sub(r'::selection\{background:#[a-f0-9]+;color:#[a-f0-9]+\}', '::selection{background:#ffffff;color:#000000}', content)

# 2. Accents / Golds to Silver
content = content.replace('#c39a5f', '#c0c0c0')
content = content.replace('#8a6b3d', '#a9a9a9')

# 3. Replace all background colors with #000000
# Covers background:#... and background-color:#...
content = re.sub(r'background(?:-color)?:\s*#(?:f2f0ec|ece9e2|16150f|0b0b0a)', 'background:#000000', content)

# 4. Replace all text colors with #ffffff
content = re.sub(r'(?<!-)color:\s*#(?:f2f0ec|ece9e2|16150f|0b0b0a)', 'color:#ffffff', content)

# 5. Handle rgba values
# Dark rgba -> transparent black
content = content.replace('rgba(11,11,10', 'rgba(0,0,0')
content = content.replace('rgba(22,21,15', 'rgba(0,0,0')

# Light rgba -> transparent white
content = content.replace('rgba(236,233,226', 'rgba(255,255,255')
content = content.replace('rgba(242,240,236', 'rgba(255,255,255')

# 6. Any stray borders
content = re.sub(r'border(?:-[a-z]+)?:\s*1px solid #(?:f2f0ec|ece9e2|16150f|0b0b0a)', 'border:1px solid #ffffff', content)

with open(file_path, "w") as f:
    f.write(content)

print("Color replacement complete.")
