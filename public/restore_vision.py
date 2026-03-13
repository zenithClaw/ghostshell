import os

path = '/Users/mr.xie/.openclaw/workspace/ghostshell/public/index.html'
with open(path, 'r') as f:
    html = f.read()

# 恢复吹牛逼文案，因为我们要真干了！
html = html.replace('Always-on-Top Scratchpad', 'Context-Aware Tabs')
html = html.replace('A persistent, ephemeral layer for your immediate thoughts. GhostShell stays above your windows, providing a clutter-free space for snippets, codes, and ideas.', 
                    'Windows don\'t just minimize—they transform. Push any window to the screen edge and watch it become a minimal, glowing tab. One click to resurrect, zero clutter in your workspace.')

with open(path, 'w') as f:
    f.write(html)
