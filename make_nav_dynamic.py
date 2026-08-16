import re

file_path = "design/F.QUAD Website.dc.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add mix-blend-mode: difference to all headers
header_str1 = 'padding:24px 44px;transition:transform .5s cubic-bezier(.22,1,.36,1),background .4s,border-color .4s;border-bottom:1px solid transparent"'
header_str2 = 'padding:26px 56px;transition:transform .5s cubic-bezier(.22,1,.36,1),background .4s,border-color .4s;border-bottom:1px solid transparent"'

content = content.replace(header_str1, header_str1[:-1] + ';mix-blend-mode:difference"')
content = content.replace(header_str2, header_str2[:-1] + ';mix-blend-mode:difference"')

# 2. Remove the JS that adds a solid background on scroll
content = re.sub(r'\s*nav\.style\.background = past \? navBg : \'transparent\';', '', content)
content = re.sub(r'\s*nav\.style\.backdropFilter = past \? \'blur\(10px\)\' : \'none\';', '', content)
content = re.sub(r'\s*nav\.style\.borderBottomColor = past \? navLine : \'transparent\';', '', content)

with open(file_path, "w") as f:
    f.write(content)

print("Navbar updated to use difference blending.")
