import re

file_path = "design/F.QUAD Website.dc.html"
with open(file_path, "r") as f:
    content = f.read()

# Replace the difference blend mode with glassmorphic styling
glass_style = 'border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(12,12,12,0.6);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)'
content = content.replace('border-bottom:1px solid transparent;mix-blend-mode:difference', glass_style)

with open(file_path, "w") as f:
    f.write(content)

print("Navbar updated to glassmorphic.")
