# GhostShell

**The invisible interface between your screen and your thoughts.**

GhostShell is a macOS desktop context layer that provides an ultra-low latency, always-on-top, frosted-glass scratchpad. It lives independently of your desktop workspaces and follows your active monitor.

## What is this?

Think of GhostShell as an "invisible sticky note" applied directly to your monitor glass. It doesn't show up in your Dock, and it doesn't get buried under your fullscreen apps.

Just remember one shortcut: `⌥ Option + Space`.
Press it, and a frosted-glass panel fades into the center of your screen. Press it again, and it vanishes.

### The Pain Points it Solves:

1. **Context-Aware Tabs (Edge-Snapping)**
   When you don't want the panel blocking your view but you still need it handy, don't close it—**just push it to the far left or right edge of your screen.** It instantly collapses into a glowing blue minimalist tab. Need it back? Just hover your mouse over the tab, and it snaps back into a full window. Zero clutter.

2. **The Sticky Ghost (Always-on-Top Scratchpad)**
   Whether you are writing code, watching a tutorial, or in a Zoom meeting, press `Option + Space` to summon it and jot down ideas. Because it's translucent and always on top, you can read the content underneath while typing your notes over it.

3. **Multi-Display Continuity**
   Built for heavy multi-monitor users: GhostShell "recognizes" your screens. If you leave it in the top-right corner of your external monitor and unplug your laptop to go to a meeting, it safely falls back to your main screen. When you plug the HDMI back in, it instantly teleports back to that exact top-right corner on the external monitor. The logic stays with your screen.

## How to run locally

```bash
npm install
npm start
```

## Shortcuts
- `⌥ Option + Space` : Summon or Hide the GhostShell.
