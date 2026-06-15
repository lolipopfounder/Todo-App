export type Priority = "low" | "medium" | "high";

export interface Reminder {
  id: string;
  time: string; // HH:mm
  label: string;
  enabled: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  group: string;
  emoji: string;
  isCountable: boolean;
  count: number;
  goal?: number;
  reminder?: Reminder;
  completedDates: string[]; // ISO date strings "YYYY-MM-DD"
  totalCompletions: number;
  createdAt: string;
  color: string;
}

export interface DayRecord {
  date: string;
  completed: number;
  total: number;
}
