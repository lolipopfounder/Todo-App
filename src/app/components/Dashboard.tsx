import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Award, Zap, Target, ChevronLeft, ChevronRight, CheckCircle2, Circle, X } from "lucide-react";
import type { Task, DayRecord } from "./types";
import { dailyTotal } from "./store";

interface Props {
  tasks: Task[];
  history: DayRecord[];
  today: string;
  onToggleDate: (id: string, dateStr: string) => void;
}

function streak(tasks: Task[], today: string): number {
  let count = 0;
  const date = new Date(today);
  while (true) {
    const d = date.toISOString().slice(0, 10);
    const activeTasks = tasks.filter(t => t.createdAt <= d);
    if (activeTasks.length === 0) break;
    const anyDone = activeTasks.some(t => t.completedDates.includes(d));
    if (!anyDone) break;
    count++;
    date.setDate(date.getDate() - 1);
  }
  return count;
}

function avgCompletion(history: DayRecord[]): number {
  const active = history.filter(d => d.total > 0);
  if (!active.length) return 0;
  return Math.round(active.reduce((s, d) => s + (d.completed / d.total) * 100, 0) / active.length);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "10px", padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#8e8e93", marginBottom: "4px" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

type DayStatus = "all-done" | "partial" | "not-started" | "no-data" | "future";

const STATUS_BG: Record<DayStatus, string> = {
  "all-done":    "#dcfce7",
  "partial":     "#fef9c3",
  "not-started": "#fee2e2",
  "no-data":     "#f2f2f7",
  "future":      "transparent",
};
const STATUS_COLOR: Record<DayStatus, string> = {
  "all-done":    "#16a34a",
  "partial":     "#b45309",
  "not-started": "#dc2626",
  "no-data":     "#8e8e93",
  "future":      "#c7c7cc",
};
const DOT_COLOR: Record<DayStatus, string | null> = {
  "all-done":    "#16a34a",
  "partial":     "#f59e0b",
  "not-started": "#ef4444",
  "no-data":     null,
  "future":      null,
};

interface DayDetailPopupProps {
  dateStr: string;
  tasks: Task[];
  today: string;
  onToggle: (id: string, dateStr: string) => void;
  onClose: () => void;
}

function DayDetailPopup({ dateStr, tasks, today, onToggle, onClose }: DayDetailPopupProps) {
  const active = tasks.filter(t => t.createdAt <= dateStr);
  const completedCount = active.filter(t => t.completedDates.includes(dateStr)).length;
  const label = new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 flex items-end justify-center z-50"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-t-2xl overflow-y-auto"
        style={{ background: "#ffffff", maxHeight: "80vh", paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "#e5e5ea" }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-3">
          <div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "17px", fontWeight: 600, color: "#1c1c1e" }}>
              {label}
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#8e8e93", marginTop: "2px" }}>
              {active.length === 0
                ? "No tasks were active on this day"
                : `${completedCount} / ${active.length} completed`}
            </p>
          </div>
          <button onClick={onClose} style={{ color: "#8e8e93", paddingTop: "2px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Task list */}
        <div className="flex flex-col gap-2 px-5 pb-6">
          {active.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <span style={{ fontSize: "32px" }}>📅</span>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#8e8e93" }}>
                No tasks existed on this date yet.
              </p>
            </div>
          ) : (
            active.map(task => {
              const done = task.completedDates.includes(dateStr);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-3"
                  style={{
                    background: done ? "#f0fdf4" : "#ffffff",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    borderLeft: `4px solid ${done ? "#22c55e" : task.color}`,
                  }}
                >
                  <button
                    onClick={() => onToggle(task.id, dateStr)}
                    className="shrink-0 transition-all active:scale-90"
                    style={{ color: done ? "#22c55e" : "#d1d5db" }}
                  >
                    {done
                      ? <CheckCircle2 size={22} fill="#22c55e" color="#fff" />
                      : <Circle size={22} />}
                  </button>
                  <span style={{ fontSize: "16px", lineHeight: 1 }}>{task.emoji}</span>
                  <span
                    className="flex-1 truncate"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "15px",
                      fontWeight: 500,
                      color: done ? "#6b7280" : "#1c1c1e",
                      textDecoration: done ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ tasks, today, onToggleDate }: { tasks: Task[]; today: string; onToggleDate: (id: string, dateStr: string) => void }) {
  const todayDate = new Date(today + "T12:00:00");
  const [view, setView] = useState({ year: todayDate.getFullYear(), month: todayDate.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthLabel = new Date(view.year, view.month, 1)
    .toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDow = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  function getStatus(dateStr: string): DayStatus {
    if (dateStr > today) return "future";
    const active = tasks.filter(t => t.createdAt <= dateStr);
    if (active.length === 0) return "no-data";
    const done = active.filter(t => t.completedDates.includes(dateStr)).length;
    if (done === active.length) return "all-done";
    if (done > 0) return "partial";
    return "not-started";
  }

  const emptyCells = Array(firstDow).fill(null);
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const dateStr = `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return { day: d, dateStr };
  });
  const cells = [...emptyCells, ...dayCells];

  const prev = () => setView(v => { const d = new Date(v.year, v.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  const next = () => setView(v => { const d = new Date(v.year, v.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; });

  return (
    <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#f2f2f7" }}>
          <ChevronLeft size={16} color="#1c1c1e" />
        </button>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 700, color: "#1c1c1e" }}>
          {monthLabel}
        </p>
        <button onClick={next} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#f2f2f7" }}>
          <ChevronRight size={16} color="#1c1c1e" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d => (
          <div key={d} className="text-center py-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: "#8e8e93" }}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} />;
          const { day, dateStr } = cell as { day: number; dateStr: string };
          const status = getStatus(dateStr);
          const isToday = dateStr === today;
          const dot = DOT_COLOR[status];
          return (
            <button
              key={dateStr}
              onClick={() => { if (status !== "future") setSelectedDate(dateStr); }}
              className="rounded-xl flex flex-col items-center justify-center py-1.5 transition-all active:scale-95"
              style={{
                background: STATUS_BG[status],
                border: isToday ? "2px solid #1e3a5f" : "2px solid transparent",
                minHeight: "44px",
                cursor: status === "future" ? "default" : "pointer",
              }}
            >
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: isToday ? 700 : 500, color: STATUS_COLOR[status], lineHeight: 1 }}>
                {day}
              </span>
              {dot && <div className="mt-0.5 rounded-full" style={{ width: 5, height: 5, background: dot }} />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {[
          { label: "All done",    bg: "#dcfce7", border: "#16a34a" },
          { label: "Partial",     bg: "#fef9c3", border: "#f59e0b" },
          { label: "Not started", bg: "#fee2e2", border: "#ef4444" },
          { label: "No data",     bg: "#f2f2f7", border: "#c7c7cc" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="rounded-sm" style={{ width: 12, height: 12, background: item.bg, border: `1.5px solid ${item.border}` }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#8e8e93" }}>{item.label}</span>
          </div>
        ))}
      </div>

      {selectedDate && (
        <DayDetailPopup
          dateStr={selectedDate}
          tasks={tasks}
          today={today}
          onToggle={onToggleDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

export function Dashboard({ tasks, history, today, onToggleDate }: Props) {
  const [chartTab, setChartTab] = useState<string>("completion");
  const countableTasks = tasks.filter(t => t.isCountable);

  const dayLabel = (date: string) => {
    const dt = new Date(date + "T12:00:00");
    return `${dt.getDate()} ${dt.toLocaleDateString("en-US", { weekday: "short" })}`;
  };

  const last14 = history.slice(-14).map(d => ({
    ...d,
    dateLabel: dayLabel(d.date),
    pct: d.total ? Math.round((d.completed / d.total) * 100) : 0,
  }));

  const selectedTask = countableTasks.find(t => t.id === chartTab) ?? null;
  const taskSeries = selectedTask
    ? last14.map(d => ({ dateLabel: d.dateLabel, count: dailyTotal(selectedTask, d.date) }))
    : [];

  const currentStreak = streak(tasks, today);
  const avg = avgCompletion(history.slice(-14));
  const todayRecord = history.find(d => d.date === today);
  const totalAllTime = tasks.reduce((s, t) => s + t.totalCompletions, 0);
  const bestTask = [...tasks].sort((a, b) => b.totalCompletions - a.totalCompletions)[0];

  const statCards = [
    { icon: <Zap size={18} />, label: "Streak", value: `${currentStreak}d`, color: "#f59e0b", bg: "#fffbeb" },
    { icon: <TrendingUp size={18} />, label: "14-day avg", value: `${avg}%`, color: "#3b82f6", bg: "#eff6ff" },
    { icon: <Target size={18} />, label: "Today", value: todayRecord ? `${todayRecord.completed}/${todayRecord.total}` : "0/0", color: "#22c55e", bg: "#f0fdf4" },
    { icon: <Award size={18} />, label: "All time", value: totalAllTime, color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(s => (
          <div
            key={s.label}
            className="rounded-2xl p-4"
            style={{ background: s.bg }}
          >
            <div className="flex items-center gap-1.5 mb-2" style={{ color: s.color }}>
              {s.icon}
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "26px", fontWeight: 700, color: s.color, lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#8e8e93", marginTop: "4px" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly calendar */}
      <CalendarView tasks={tasks} today={today} onToggleDate={onToggleDate} />

      {/* Progress chart with tabs */}
      <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1c1c1e", marginBottom: "12px" }}>
          {selectedTask ? `${selectedTask.title} (14 days)` : "Completion Rate (14 days)"}
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
          {[{ id: "completion", title: "Completion Rate", color: "#3b82f6", emoji: "" },
            ...countableTasks.map(t => ({ id: t.id, title: t.title, color: t.color, emoji: t.emoji }))]
            .map(tab => {
              const active = chartTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setChartTab(tab.id)}
                  className="px-3 py-1.5 rounded-lg shrink-0 transition-all"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 500,
                    background: active ? `${tab.color}1a` : "#f2f2f7",
                    color: active ? tab.color : "#6b7280",
                    border: active ? `1px solid ${tab.color}` : "1px solid transparent",
                  }}
                >
                  {tab.emoji ? `${tab.emoji} ` : ""}{tab.title}
                </button>
              );
            })}
        </div>

        {selectedTask ? (
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={taskSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedTask.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={selectedTask.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="dateLabel" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fill: "#8e8e93" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fill: "#8e8e93" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name={selectedTask.title} stroke={selectedTask.color} strokeWidth={2} fill="url(#taskGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={last14} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pctGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="dateLabel" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fill: "#8e8e93" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fill: "#8e8e93" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pct" name="%" stroke="#3b82f6" strokeWidth={2} fill="url(#pctGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tasks completed bar chart */}
      <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1c1c1e", marginBottom: "16px" }}>
          Tasks Done Per Day
        </p>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={last14} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="doneGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="dateLabel" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fill: "#8e8e93" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fill: "#8e8e93" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="completed" name="done" stroke="#3b82f6" strokeWidth={2} fill="url(#doneGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-task completion table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1c1c1e" }}>
            Task History (last 7 days)
          </p>
        </div>
        <div>
          {[...tasks]
            .sort((a, b) => b.totalCompletions - a.totalCompletions)
            .map((task, i, arr) => {
              const last7 = Array.from({ length: 7 }).map((_, j) => {
                const d = new Date(today);
                d.setDate(d.getDate() - (6 - j));
                return d.toISOString().slice(0, 10);
              });
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                >
                  <span style={{ fontSize: "18px" }}>{task.emoji}</span>
                  <span className="flex-1 truncate" style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#1c1c1e" }}>
                    {task.title}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    {last7.map(d => (
                      <div
                        key={d}
                        className="w-4 h-4 rounded"
                        title={d}
                        style={{
                          background: task.completedDates.includes(d) ? task.color : "#f2f2f7",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#8e8e93", minWidth: "32px", textAlign: "right" }}>
                    ×{task.totalCompletions}
                  </span>
                </div>
              );
            })}
        </div>
        {bestTask && (
          <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(0,0,0,0.06)", background: "#fffbeb" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#92400e" }}>
              🏆 Most consistent: {bestTask.title} (×{bestTask.totalCompletions})
            </span>
          </div>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
}
