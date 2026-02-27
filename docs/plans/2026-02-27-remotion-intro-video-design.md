# CashThesis Intro Video — Design

## Overview

10-second Remotion intro video for the CashThesis brand.

## Specs

- **Resolution:** 1920x1080
- **FPS:** 30
- **Duration:** 300 frames (10 seconds)
- **Background:** `#0a0a0f` (CashThesis dark theme)

## Timeline

| Time | Element | Animation |
|------|---------|-----------|
| 0-2s | Dark background | Static |
| 0.5-2.5s | Title: "CashThesis - AI Content Factory" | Fade in, color `#00e68a` |
| 2.5s-10s | Title | Pulse: scale 1.0→1.03→1.0 loop via `Math.sin()` |
| 3-4.5s | Subtitle: "Find Trends. Create Content. Make Money." | Slide up from bottom + fade in, spring `{ damping: 200 }` |
| 4.5s-10s | Subtitle | Static, white `#ffffff` |

## Tech

- Remotion project in `cashthesis-videos/`
- Single composition component `IntroVideo.tsx`
- All animations via `useCurrentFrame()` + `interpolate()` (no CSS animations)
- Fonts: Outfit (title), JetBrains Mono or Outfit (subtitle)
