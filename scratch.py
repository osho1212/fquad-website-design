import sys
import re

file_path = "design/F.QUAD Website.dc.html"
with open(file_path, "r") as f:
    content = f.read()

# Remove from head
content = content.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>\n', "")
content = content.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>\n', "")

# Add to helmet
if "gsap.min.js" not in content:
    content = content.replace(
        "<helmet data-dc-atomics>",
        """<helmet data-dc-atomics>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>"""
    )

with open(file_path, "w") as f:
    f.write(content)
print("Updated successfully")
