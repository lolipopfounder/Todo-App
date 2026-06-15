# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install      # install dependencies
pnpm dev          # start dev server (Vite)
pnpm build        # production build
```

No lint or test commands are configured.

## Architecture

Mobile-first habit/todo tracker (max-width 430px) built with React + TypeScript + Vite. No routing — the entire app lives in `src/app/App.tsx` as a single tabbed layout.

### State management

All task state lives in `src/app/components/store.ts`. The `useTasks` hook is the single source of truth — it reads/writes to `localStorage` under the key `taskflow_tasks_v2` and exposes CRUD actions and derived state. `buildHistory` (also in `store.ts`) computes the `DayRecord[]` array used by the Dashboard charts. `App.tsx` calls `useTasks` at the root and passes everything down as props.

### Data model (`types.ts`)

- **Task** — core entity. `completedDates: string[]` holds `"YYYY-MM-DD"` strings; completion is toggled per-day via `toggleToday`. `isCountable` tasks also have a live `count` and optional `goal`. Each task can have one optional `Reminder`.
- **DayRecord** — `{ date, completed, total }` snapshot used for charts.
- Tasks are assigned a color from the fixed `COLORS` palette in `store.ts` at creation time.

### Component layout

| Component | Role |
|---|---|
| `App.tsx` | Tab shell, header, FAB, modal open/close state |
| `TaskList.tsx` | "Today" tab — renders tasks grouped by `task.group` |
| `Dashboard.tsx` | "Progress" tab — Recharts area/bar charts + per-task 7-day heatmap |
| `RemindersPanel.tsx` | "Reminders" tab — lists tasks with reminders, allows toggle/edit |
| `AddTaskModal.tsx` / `EditTaskModal.tsx` | Create/edit modals, rendered at App root |

### UI conventions

- Styling: Tailwind CSS v4 (via `@tailwindcss/vite`) + inline `style` props for design-token values (colors, font sizes). shadcn/ui components live in `src/app/components/ui/` and wrap Radix UI primitives.
- `@` is aliased to `src/` in both Vite and TypeScript.
- Figma-exported assets use the `figma:asset/<filename>` import scheme (resolved by the custom Vite plugin in `vite.config.ts` to `src/assets/`).
- The `react` and `react-dom` packages are declared as optional peer dependencies; they must be present at runtime but are managed separately from `dependencies`.
