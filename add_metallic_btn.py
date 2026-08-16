import re

file_path = "design/F.QUAD Website.dc.html"
with open(file_path, "r") as f:
    content = f.read()

metallic_css = """
.btn-metallic {
  font-family: 'Good Times', sans-serif;
  font-size: 10px;
  letter-spacing: .18em;
  padding: 12px 20px;
  font-weight: 500;
  color: #111 !important;
  text-decoration: none;
  background: linear-gradient(135deg, #e6e6e6 0%, #a6a6a6 40%, #c6c6c6 50%, #8a8a8a 60%, #dfdfdf 100%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  display: inline-block;
  cursor: pointer;
}
.btn-metallic:hover {
  background: linear-gradient(135deg, #f5f5f5 0%, #b8b8b8 40%, #d8d8d8 50%, #9a9a9a 60%, #f0f0f0 100%);
  color: #000 !important;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.9), 0 4px 8px rgba(0, 0, 0, 0.5);
}
.btn-metallic::after {
  content: '';
  position: absolute;
  top: 0; left: -150%;
  width: 100%; height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
  transform: skewX(-20deg);
  animation: fq-glimmer 3.5s infinite;
  z-index: 1;
}
@keyframes fq-glimmer {
  0% { left: -150%; }
  15% { left: 150%; }
  100% { left: 150%; }
}
"""

# Insert CSS right before closing </style>
content = content.replace('</style>', metallic_css + '\n</style>')

# Replace the 3 top-right nav CTA buttons with the class
btn_str1 = 'style="font-family:\'Good Times\',sans-serif;font-size:10px;letter-spacing:.18em;padding:12px 20px;background:#c0c0c0;color:#ffffff;font-weight:500" style-hover="background:#000000"'
btn_str2 = 'style="font-family:\'Good Times\',sans-serif;font-size:10.5px;letter-spacing:.16em;border:1px solid rgba(ffffff,.35);padding:11px 18px" style-hover="background:#000000;color:#ffffff;border-color:ffffff"'

# Wait, btn_str2 has a different string because I ran a global replacement on #16150f.
# Let's just use regex to target the specific a tag inside the flex container at the end of the header.

# The navbars look like:
# <div style="display:flex;justify-content:flex-end">
#   <a href="#contactb" style="...">START A PROJECT</a>
# </div>

# Let's match: <div style="display:flex;justify-content:flex-end">\s*<a href="([^"]+)" style="[^"]+" style-hover="[^"]+">START A PROJECT</a>
def replace_nav_cta(match):
    href = match.group(1)
    return f'<div style="display:flex;justify-content:flex-end">\n      <a href="{href}" class="btn-metallic">START A PROJECT</a>'

content = re.sub(
    r'<div style="display:flex;justify-content:flex-end">\s*<a href="([^"]+)" style="[^"]+"(?: style-hover="[^"]+")?>START A PROJECT</a>',
    replace_nav_cta,
    content
)

with open(file_path, "w") as f:
    f.write(content)

print("Metallic buttons updated.")
