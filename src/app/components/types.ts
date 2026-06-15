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
  goal?: number; // when `sets` is set, this is reps per set; otherwise target count
  sets?: number; // optional target number of sets (countable tasks)
  dailyCounts: Record<string, number>; // "YYYY-MM-DD" -> sets (or units) logged that day
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
