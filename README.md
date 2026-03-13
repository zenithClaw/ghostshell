# GhostShell

**The invisible interface between your screen and your thoughts.**

GhostShell is a macOS desktop context layer that provides an ultra-low latency, always-on-top, frosted-glass scratchpad. It lives independently of your desktop workspaces and follows your active monitor.

## What is this? (通俗人话版)

GhostShell 就像是贴在你屏幕上的一张“隐形便利贴”。它不会出现在你底部的 Dock 栏里，也不会被其他全屏软件挡住。

你只需要记住一个快捷键：`⌥ Option + Space`。
按一下，屏幕正中央就会浮现出一块极具苹果质感的毛玻璃面板；再按一下，它就瞬间消失。

### 核心解决什么痛点？

1. **上下文感知标签页 (Context-Aware Tabs)**
   当你不想让它挡在屏幕中间时，不用关掉它，**直接把它推到屏幕的最左边或者最右边**。它会瞬间收缩成一条极简的、发光的蓝色线条（Tab）。当你需要它时，鼠标碰一下那条线，它就会“嘭”地一声弹回来。工作区彻底干净。

2. **随时随地的置顶草稿本 (The Sticky Ghost)**
   你在写代码、看视频、或者开线上会议时，如果突然有灵感或者要记个快捷键，按 `Option + Space` 呼出它直接写。因为它是永远置顶且半透明的，你可以一边看着底下的内容，一边在它上面做记录。

3. **多屏连续性记忆 (Multi-Display Continuity)**
   对于插着多块外接屏幕的重度用户：GhostShell 会“认屏幕”。你把它放在大屏的右上角，拔掉线去开会，它会自动回到笔记本屏幕；你开完会把线插回来，它又会分毫不差地瞬移回大屏的右上角。逻辑跟着你的屏幕走。

## How to run locally

```bash
npm install
npm start
```

## Shortcuts
- `⌥ Option + Space` : Summon or Hide the GhostShell.
