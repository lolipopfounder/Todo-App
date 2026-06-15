# Plan: Mobile-first Redesign with Groups, Count Buttons, Edit, Light Theme

## Context
The user wants a full redesign of the TaskFlow app to match a mobile-first reference image. The current app is desktop-oriented with a dark GitHub theme. The new design requires a light theme, mobile layout, task grouping, inline +/- count buttons for countable tasks, and the ability to edit existing tasks.

---

## Key Changes

### 1. Light Theme (`src/styles/theme.css`)
Update `:root` tokens:
- `--background`: `#f2f2f7` (light gray iOS-style)
- `--foreground`: `#1c1c1e`
- `--card`: `#ffffff`
- `--card-foreground`: `#1c1c1e`
- `--primary`: `#3b82f6` (blue accent)
- `--muted-foreground`: `#8e8e93`
- `--border`: `rgba(0,0,0,0.08)`
- Remove dark override block (or keep it but app stays light)

### 2. Updated `types.ts`
Add fields to `Task`:
```ts
group: string;           // e.g. "WORK", "EXERCISE", "REMINDER"
isCountable: boolean;    // whether it has +/- counter
count: number;           // current session count
goal?: number;           // optional goal (e.g. "0 / 20 goal")
emoji?: string;          // optional emoji icon shown in card
```

### 3. Updated `store.ts`
- Seed tasks updated to include `group`, `isCountable`, `count`, `goal`, `emoji`
- Add `incrementCount(id)` and `decrementCount(id)` functions
- `addTask` accepts group name
- Groups auto-created from task data (no separate group entity needed)

### 4. Redesigned `App.tsx`
- **Mobile container**: `max-w-sm mx-auto` so it renders as phone-width on desktop too
- **Bottom tab bar** instead of top tab nav (mobile pattern)
- Remove live clock from header
- Header: just app logo/title
- Light background throughout

### 5. New/Redesigned `TaskList.tsx`
- Group tasks by `task.group` field, render section headers (e.g. "WORK", "EXERCISE")
- Each task card:
  - Rounded white card with subtle shadow
  - Left: circle checkbox (tapping marks done, green fill + strikethrough)
  - Center: emoji icon + task title + description lines + "X / Y goal" if applicable
  - Right: `−  count  +` buttons if `isCountable`, else nothing (or small icon)
  - Completed tasks: green tinted card, strikethrough title, checkmark replaces circle
- Section headers styled as small uppercase labels above each group

### 6. New `EditTaskModal.tsx`
- Same structure as `AddTaskModal` but pre-filled with existing task data
- Fields: title, description, group (text input or dropdown of existing groups), priority, emoji, isCountable toggle, goal (number input shown when countable), reminder
- Triggered by tapping on the task card title/body area (or an edit icon)
- Saves via `updateTask(id, updates)`

### 7. Updated `AddTaskModal.tsx`
- Add `group` field: text input with autocomplete from existing groups
- Add `isCountable` toggle
- When countable: show `goal` number input
- Add `emoji` picker (simple text input for now)

### 8. `Dashboard.tsx` (minimal change)
- Update chart colors/backgrounds to match light theme
- Keep existing charts and stat cards

### 9. `RemindersPanel.tsx` (minimal change)
- Update colors to light theme

---

## File Modifications

| File | Action |
|------|--------|
| `src/styles/theme.css` | Light theme tokens |
| `src/app/components/types.ts` | Add group, isCountable, count, goal, emoji |
| `src/app/components/store.ts` | Add increment/decrement, update seed data, update addTask |
| `src/app/App.tsx` | Mobile container, bottom tab bar |
| `src/app/components/TaskList.tsx` | Full rewrite — groups, cards, count buttons |
| `src/app/components/AddTaskModal.tsx` | Add group, isCountable, goal, emoji fields |
| `src/app/components/EditTaskModal.tsx` | New file — pre-filled edit form |
| `src/app/components/Dashboard.tsx` | Light theme color updates |
| `src/app/components/RemindersPanel.tsx` | Light theme color updates |

---

## Task Card Visual Spec (from reference image)

```
┌─────────────────────────────────────────────┐
│  ○  🎯  Task Title              −   0   +   │
│     0 / 20 goal                             │
│     Description line 1                      │
│     Description line 2                      │
└─────────────────────────────────────────────┘

Completed variant (green tint):
┌─────────────────────────────────────────────┐  ← green border-left
│  ✓  🏋  ~~Task Title~~          −   4   +   │  ← blue bg check
│     ✓ Done! (4 × 20)                        │
└─────────────────────────────────────────────┘
```

- Non-countable task: no `−  0  +` on the right (right side empty or shows small ellipsis menu)
- Group header: small gray uppercase text, full width, no card

---

## Verification
1. App renders in narrow mobile width (~390px) with correct light colors
2. Tasks appear grouped under section labels
3. Tapping `+` increments the count shown between `−` and `+`
4. Tapping `−` decrements count (min 0)
5. Tapping the checkbox marks done (green, strikethrough) or undone
6. Tapping edit icon opens EditTaskModal pre-filled; saving updates the task in-place
7. Adding a task with a group name places it in the correct section
8. Dashboard and Reminders panels render with light colors
