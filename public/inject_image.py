import os

path = '/Users/mr.xie/.openclaw/workspace/ghostshell/public/index.html'
with open(path, 'r') as f:
    html = f.read()

old_bento = '<div class="bento-card large" style="animation-delay: 0.3s;">'
new_bento = """<div class="bento-card large" style="animation-delay: 0.3s; padding: 0; display: flex; flex-direction: row; overflow: hidden; justify-content: space-between;">
      <div style="flex: 1; padding: 48px; display: flex; flex-direction: column; justify-content: center; z-index: 2;">
        <h3>Context-Aware Floating Layer</h3>
        <p style="max-width: 100%;">A temporary note at hand with frosted glass translucency. It floats above everything without interrupting your current work flow.</p>
      </div>
      <div style="flex: 1.2; background: url('assets/app-demo.png') center right / contain no-repeat; margin-right: -20px; z-index: 1;"></div>
    </div>
"""

# replace the first bento card with the image injected one
html = html.replace(
    '<div class="bento-card large" style="animation-delay: 0.3s;">\n      <div class="visual-overlay"></div>\n      <div class="visual-nodes">\n        <div class="node"></div><div class="node active"></div><div class="node"></div>\n      </div>\n      <h3>Context-Aware Tabs</h3>\n      <p>Windows don\'t just minimize—they transform. Push any window to the screen edge and watch it become a minimal, glowing tab. One click to resurrect, zero clutter in your workspace.</p>\n    </div>',
    new_bento
)

with open(path, 'w') as f:
    f.write(html)
