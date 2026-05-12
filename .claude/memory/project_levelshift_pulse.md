---
name: levelshift-pulse-project
description: LevelShift Pulse — AI Content Operations Platform. Full project context, tech stack, structure, and status.
metadata:
  type: project
---

LevelShift Pulse is a complete, enterprise-grade AI Content Operations Platform built in this repo (`marketing_studio`). It is a standalone product — **not** related to or importing from any Signal codebase.

**Why:** The Marketing team at LevelShift needs a platform to orchestrate 13 AI agents producing 310 content assets per quarter across 5 Business Units with 4 human approval gates.

**How to apply:** When continuing work on this project, the full application is built and the dev server runs at `http://localhost:5175` (or next available port). Run `npm run dev` from the project root.

## Tech Stack
- React 18 + Vite 5
- Tailwind CSS v3 (class-based dark mode)
- ReactFlow (agent pipeline graph)
- Zustand (state management — no Context/useReducer)
- React Router v6 (nested routes via AppShell outlet)
- Framer Motion (animations)
- Lucide React (icons)
- @fontsource/inter + @fontsource/jetbrains-mono

## File Structure
```
src/
  data/          agents.js, content.js, gates.js, performance.js, activity.js
  store/         useAppStore.js, useAgentStore.js, useContentStore.js, useGateStore.js
  hooks/         useSimulation.js, useCountUp.js, useSLATimer.js
  lib/           utils.js (cn, formatCurrency, STATUS_CONFIG, LAYER_COLORS, etc.)
  components/
    layout/      AppShell.jsx, Sidebar.jsx, TopBar.jsx
    ui/          MetricCard, StatusBadge, SLATimer, QualityScore, ActivityFeed, ProgressRing
  pages/
    CommandCentre.jsx    (/)
    PipelinePage.jsx     (/pipeline)  — ReactFlow 4-layer graph
    ContentTracker.jsx   (/content)   — filterable table of 310 assets
    GateManager.jsx      (/gates)     — 4 gates with SLA timers and approve actions
    PerformancePage.jsx  (/performance)
    SettingsPage.jsx     (/settings)  — role switcher + theme toggle
```

## Roles
- Marketing Head: `/`, `/performance`, `/gates` — no telemetry/costs/agent internals
- Campaign Lead: all pages except `/settings` — no internals
- Content Editor: `/`, `/content`, `/gates` — no internals
- AI COE: all pages — full telemetry, token costs, agent internals

## Simulation
`useSimulation` hook (called in AppShell) ticks `useAgentStore.tickSimulation` every 3.5s, animating agent progress bars and adding activity feed entries.

## Design System
- Light bg: #F8F9FA, cards: #FFFFFF, accent: #16A34A (brand green)
- Dark bg: #0A0A0A, cards: #1A1A1A, borders: #2A2A2A
- Fonts: Inter (body), JetBrains Mono (data/scores)
- Node colors: Layer1=#2563EB, Layer2=#16A34A, Gates=#F59E0B, Layer3=#7C3AED, Layer4=#0891B2
