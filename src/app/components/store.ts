import { useState, useEffect } from "react";
import type { Task, DayRecord } from "./types";

const STORAGE_KEY = "taskflow_tasks_v2";

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
    count: 0,
    goal: 20,
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
    count: 0,
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
    count: 0,
    goal: 3,
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
    count: 4,
    goal: 20,
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
    count: 2,
    goal: 70,
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
    count: 1,
    goal: 4,
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
    count: 0,
    reminder: { id: "r7", time: "09:00", label: "Send the email!", enabled: true },
    completedDates: [],
    totalCompletions: 0,
    createdAt: "2026-06-15",
    color: COLORS[6],
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : SEED_TASKS;
    } catch {
      return SEED_TASKS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const todayStr = today();

  function addTask(task: Omit<Task, "id" | "completedDates" | "totalCompletions" | "createdAt" | "color">) {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completedDates: [],
      totalCompletions: 0,
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
    setTasks(prev => prev.map(t => t.id === id ? { ...t, count: t.count + 1 } : t));
  }

  function decrementCount(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, count: Math.max(0, t.count - 1) } : t));
  }

  const groups = Array.from(new Set(tasks.map(t => t.group))).filter(Boolean);

  return { tasks, addTask, updateTask, deleteTask, toggleToday, toggleDate, incrementCount, decrementCount, today: todayStr, COLORS, groups };
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
