import os

path = '/Users/mr.xie/.openclaw/workspace/ghostshell/public/index.html'
with open(path, 'r') as f:
    html = f.read()

# 1. 移除 Pricing 和 Developers 链接
html = html.replace('<a href="#developers">Developers</a>', '')
html = html.replace('<a href="#pricing">Pricing</a>', '')

# 2. 移除 View Documentation 按钮
html = html.replace('<a href="#" class="btn-secondary">View Documentation</a>', '')

# 3. 将 Get GhostShell 链接改为 GitHub
html = html.replace('<a href="#" class="btn-primary">Get GhostShell</a>', 
                    '<a href="https://github.com/zenithClaw/ghostshell" target="_blank" class="btn-primary">Get GhostShell</a>')

# 4. 移除“上下文感知标签页”这段吹牛逼但还没做的功能描述卡片，换成现有的核心功能
old_bento_content = """<h3>Context-Aware Floating Layer</h3>
        <p style="max-width: 100%;">A temporary note at hand with frosted glass translucency. It floats above everything without interrupting your current work flow.</p>"""

# 寻找那个大的bento卡片并精准替换文案，确保不误伤
html = html.replace('Context-Aware Tabs', 'Always-on-Top Scratchpad')
html = html.replace('Windows don\'t just minimize—they transform. Push any window to the screen edge and watch it become a minimal, glowing tab. One click to resurrect, zero clutter in your workspace.', 
                    'A persistent, ephemeral layer for your immediate thoughts. GhostShell stays above your windows, providing a clutter-free space for snippets, codes, and ideas.')

with open(path, 'w') as f:
    f.write(html)
