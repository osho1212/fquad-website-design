import re

file_path = "design/F.QUAD Website.dc.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Remove Google Fonts links
content = re.sub(r'<link rel="preconnect" href="https://fonts\.googleapis\.com">\n', '', content)
content = re.sub(r'<link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin>\n', '', content)
content = re.sub(r'<link href="https://fonts\.googleapis\.com/css2[^>]+>\n', '', content)

# 2. Add @font-face and update body font
font_face = """@font-face {
  font-family: 'Good Times';
  src: url('../assets/good_times/Good Times Rg.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
}
html{-webkit-font-smoothing:antialiased}"""

content = content.replace("html{-webkit-font-smoothing:antialiased}", font_face)

# 3. Replace all inline font-family references
# Archivo,sans-serif
content = re.sub(r"font-family:Archivo[^;\"']*", "font-family:'Good Times',sans-serif", content)
# IBM Plex Mono
content = re.sub(r"font-family:'IBM Plex Mono'[^;\"']*", "font-family:'Good Times',sans-serif", content)
# Instrument Serif
content = re.sub(r"font-family:'Instrument Serif'[^;\"']*", "font-family:'Good Times',sans-serif", content)

with open(file_path, "w") as f:
    f.write(content)

print("Font replacement complete.")
