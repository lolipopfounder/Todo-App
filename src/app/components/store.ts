import { useState, useEffect, useRef } from "react";
import type { Task, DayRecord } from "./types";

const STORAGE_KEY = "taskflow_tasks_v2";

/** Minimal shape check so a bad import/blob can't replace tasks with garbage. */
function isTaskLike(t: unknown): t is Task {
  return (
    !!t &&
    typeof t === "object" &&
    typeof (t as Task).id === "string" &&
    typeof (t as Task).title === "string" &&
    Array.isArray((t as Task).completedDates)
  );
}

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const COLORS = [
  "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316",
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const SEED_TASKS: Task[] = [
  {
    id: "t1",
    title: "Apply for jobs",
    description: "Apply for 10 Intern in Big Company",
    priority: "high",
    group: "WORK",
    emoji: "💼",
    isCountable: true,
    goal: 20,
    dailyCounts: { "2026-06-12": 8, "2026-06-13": 12, "2026-06-14": 5 },
    completedDates: ["2026-06-12", "2026-06-13", "2026-06-14"],
    totalCompletions: 3,
    createdAt: "2026-06-08",
    color: COLORS[0],
  },
  {
    id: "t2",
    title: "Build an app",
    description: "1. Platform for auto posting marketing product\n2. TikTok but as a Study platform with community too.",
    priority: "medium",
    group: "WORK",
    emoji: "🚀",
    isCountable: false,
    dailyCounts: {},
    completedDates: ["2026-06-13", "2026-06-14"],
    totalCompletions: 2,
    createdAt: "2026-06-08",
    color: COLORS[1],
  },
  {
    id: "t3",
    title: "Solve LeetCode problems",
    description: "Breakdown the problem to sub-problem\nTake 10 min only for easy level\nFind the Base case",
    priority: "high",
    group: "EXERCISE",
    emoji: "🎯",
    isCountable: true,
    goal: 3,
    dailyCounts: { "2026-06-11": 2, "2026-06-13": 4 },
    completedDates: ["2026-06-11", "2026-06-13"],
    totalCompletions: 2,
    createdAt: "2026-06-09",
    color: COLORS[2],
  },
  {
    id: "t4",
    title: "Push-ups",
    description: "",
    priority: "medium",
    group: "EXERCISE",
    emoji: "💪",
    isCountable: true,
    goal: 20, // reps per set
    sets: 3,
    dailyCounts: { "2026-06-09": 2, "2026-06-10": 3, "2026-06-11": 1, "2026-06-12": 3, "2026-06-13": 4, "2026-06-14": 2 },
    completedDates: ["2026-06-09", "2026-06-10", "2026-06-11", "2026-06-12", "2026-06-13", "2026-06-14"],
    totalCompletions: 6,
    createdAt: "2026-06-09",
    color: COLORS[3],
  },
  {
    id: "t5",
    title: "Plank",
    description: "Before was 45s",
    priority: "medium",
    group: "EXERCISE",
    emoji: "🧘",
    isCountable: true,
    goal: 70, // seconds per set
    sets: 2,
    dailyCounts: { "2026-06-10": 1, "2026-06-11": 2, "2026-06-12": 2, "2026-06-13": 1, "2026-06-14": 2 },
    completedDates: ["2026-06-10", "2026-06-11", "2026-06-12", "2026-06-13", "2026-06-14"],
    totalCompletions: 5,
    createdAt: "2026-06-10",
    color: COLORS[4],
  },
  {
    id: "t6",
    title: "Jumping Rope",
    description: "",
    priority: "low",
    group: "EXERCISE",
    emoji: "🏃",
    isCountable: true,
    goal: 50, // jumps per set
    sets: 4,
    dailyCounts: { "2026-06-12": 2, "2026-06-14": 3 },
    reminder: { id: "r6", time: "07:30", label: "Morning exercise!", enabled: true },
    completedDates: ["2026-06-12", "2026-06-14"],
    totalCompletions: 2,
    createdAt: "2026-06-10",
    color: COLORS[5],
  },
  {
    id: "t7",
    title: "Mail Coda for internship",
    description: "",
    priority: "high",
    group: "REMINDER",
    emoji: "📧",
    isCountable: false,
    dailyCounts: {},
    reminder: { id: "r7", time: "09:00", label: "Send the email!", enabled: true },
    completedDates: [],
    totalCompletions: 0,
    createdAt: "2026-06-15",
    color: COLORS[6],
  },
];

// Migrate pre-v2.1 tasks: single `count` -> per-day `dailyCounts`.
function migrate(parsed: (Task & { count?: number })[], todayStr: string): Task[] {
  return parsed.map(t => {
    if (t.dailyCounts) {
      const { count: _drop, ...rest } = t;
      return rest as Task;
    }
    const { count = 0, ...rest } = t;
    return { ...rest, dailyCounts: count ? { [todayStr]: count } : {} } as Task;
  });
}

export function useTasks() {
  // Distinguishes "no data yet" (use seed) from "data present but unparseable"
  // (keep seed for display, but don't overwrite the recoverable blob).
  const loadFailedRef = useRef(false);
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored == null) return SEED_TASKS;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        loadFailedRef.current = true;
        return SEED_TASKS;
      }
      return migrate(parsed, today());
    } catch {
      loadFailedRef.current = true;
      return SEED_TASKS;
    }
  });

  const [storageError, setStorageError] = useState<string | null>(
    loadFailedRef.current ? "Saved data couldn't be read. It's been preserved — export a backup before making changes." : null,
  );

  // Skip the first run so simply mounting (with seed/fallback data) never
  // clobbers stored data — only an actual change is persisted.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      setStorageError(null);
    } catch (e) {
      console.warn("taskflow: failed to persist tasks", e);
      setStorageError("Couldn't save — storage may be full or unavailable. Export a backup.");
    }
  }, [tasks]);

  const todayStr = today();

  function addTask(task: Omit<Task, "id" | "completedDates" | "totalCompletions" | "createdAt" | "color" | "dailyCounts">) {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completedDates: [],
      totalCompletions: 0,
      dailyCounts: {},
      createdAt: todayStr,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setTasks(prev => [...prev, newTask]);
  }

  function updateTask(id: string, updates: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function toggleToday(id: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const done = t.completedDates.includes(todayStr);
      return {
        ...t,
        completedDates: done
          ? t.completedDates.filter(d => d !== todayStr)
          : [...t.completedDates, todayStr],
        totalCompletions: done ? Math.max(0, t.totalCompletions - 1) : t.totalCompletions + 1,
      };
    }));
  }

  function toggleDate(id: string, dateStr: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const done = t.completedDates.includes(dateStr);
      return {
        ...t,
        completedDates: done
          ? t.completedDates.filter(d => d !== dateStr)
          : [...t.completedDates, dateStr],
        totalCompletions: done ? Math.max(0, t.totalCompletions - 1) : t.totalCompletions + 1,
      };
    }));
  }

  function incrementCount(id: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const current = t.dailyCounts[todayStr] ?? 0;
      return { ...t, dailyCounts: { ...t.dailyCounts, [todayStr]: current + 1 } };
    }));
  }

  function decrementCount(id: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = Math.max(0, (t.dailyCounts[todayStr] ?? 0) - 1);
      const dailyCounts = { ...t.dailyCounts };
      if (next === 0) delete dailyCounts[todayStr];
      else dailyCounts[todayStr] = next;
      return { ...t, dailyCounts };
    }));
  }

  // Restore-capable backup: JSON round-trips the nested model losslessly.
  function exportJSON() {
    triggerDownload(
      `taskflow-backup-${todayStr}.json`,
      JSON.stringify(tasks, null, 2),
      "application/json",
    );
  }

  async function importJSON(file: File): Promise<{ ok: boolean; message: string }> {
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed) || !parsed.every(isTaskLike)) {
        return { ok: false, message: "That file isn't a valid TaskFlow backup." };
      }
      setTasks(migrate(parsed as (Task & { count?: number })[], todayStr));
      return { ok: true, message: `Imported ${parsed.length} task${parsed.length !== 1 ? "s" : ""}.` };
    } catch {
      return { ok: false, message: "Couldn't read that file — is it valid JSON?" };
    }
  }

  // Spreadsheet-friendly, flat, and LOSSY — for viewing only, not restore.
  function exportCSV() {
    const cols = ["id", "title", "description", "priority", "group", "emoji", "isCountable", "goal", "sets", "totalCompletions", "createdAt", "completedDates"] as const;
    const esc = (v: unknown) => {
      const s = v == null ? "" : Array.isArray(v) ? v.join("|") : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = tasks.map(t => cols.map(c => esc((t as Record<string, unknown>)[c])).join(","));
    triggerDownload(`taskflow-export-${todayStr}.csv`, [cols.join(","), ...rows].join("\n"), "text/csv");
  }

  const groups = Array.from(new Set(tasks.map(t => t.group))).filter(Boolean);

  return { tasks, addTask, updateTask, deleteTask, toggleToday, toggleDate, incrementCount, decrementCount, today: todayStr, COLORS, groups, exportJSON, importJSON, exportCSV, storageError };
}

// Sets (or raw units) logged for a task on a given day.
export function dailyUnits(task: Task, date: string): number {
  return task.dailyCounts?.[date] ?? 0;
}

// The value to chart/display: when `sets` is configured, `goal` is reps per set,
// so the day's total = units (sets) × reps per set. Otherwise it's the raw units.
export function dailyTotal(task: Task, date: string): number {
  const units = dailyUnits(task, date);
  return task.sets != null && task.goal != null ? units * task.goal : units;
}

export function buildHistory(tasks: Task[]): DayRecord[] {
  const dateSet = new Set<string>();
  tasks.forEach(t => t.completedDates.forEach(d => dateSet.add(d)));
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dateSet.add(d.toISOString().slice(0, 10));
  }
  return Array.from(dateSet)
    .sort()
    .map(date => ({
      date,
      completed: tasks.filter(t => t.completedDates.includes(date)).length,
      total: tasks.filter(t => t.createdAt <= date).length,
    }));
}
