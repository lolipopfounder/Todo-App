import { useState } from "react";
import { CheckSquare, BarChart2, Bell, Plus } from "lucide-react";
import { TaskList } from "./components/TaskList";
import { Dashboard } from "./components/Dashboard";
import { RemindersPanel } from "./components/RemindersPanel";
import { AddTaskModal } from "./components/AddTaskModal";
import { EditTaskModal } from "./components/EditTaskModal";
import { useTasks, buildHistory } from "./components/store";
import type { Task } from "./components/types";

type Tab = "tasks" | "dashboard" | "reminders";

export default function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleToday, toggleDate, incrementCount, decrementCount, today, groups } = useTasks();
  const [tab, setTab] = useState<Tab>("tasks");
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const history = buildHistory(tasks);

  const todayTasks = tasks.filter(t => t.createdAt <= today);
  const completedToday = todayTasks.filter(t => t.completedDates.includes(today)).length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "tasks", label: "Today", icon: <CheckSquare size={22} /> },
    { id: "dashboard", label: "Progress", icon: <BarChart2 size={22} /> },
    { id: "reminders", label: "Reminders", icon: <Bell size={22} /> },
  ];

  return (
    <div
      className="size-full flex justify-center"
      style={{ background: "#f2f2f7" }}
    >
      {/* Mobile frame */}
      <div
        className="w-full flex flex-col relative"
        style={{ maxWidth: "430px", background: "#f2f2f7", minHeight: "100vh" }}
      >
        {/* Header */}
        <header
          className="flex items-center justify-between px-5 pt-12 pb-4 shrink-0"
          style={{ background: "#f2f2f7" }}
        >
          <div>
            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#1c1c1e",
              lineHeight: 1.1,
            }}>
              {tab === "tasks" ? "Today" : tab === "dashboard" ? "Progress" : "Reminders"}
            </h1>
            {tab === "tasks" && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#8e8e93", marginTop: "2px" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            )}
          </div>

          {tab === "tasks" && (
            <button
              onClick={() => setShowAdd(true)}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm"
              style={{ background: "#3b82f6" }}
            >
              <Plus size={22} color="#fff" />
            </button>
          )}
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-4 pb-24">
          {tab === "tasks" && (
            <TaskList
              tasks={tasks}
              today={today}
              groups={groups}
              onToggle={toggleToday}
              onIncrement={incrementCount}
              onDecrement={decrementCount}
              onEdit={setEditTask}
              onDelete={deleteTask}
            />
          )}
          {tab === "dashboard" && (
            <Dashboard tasks={tasks} history={history} today={today} onToggleDate={toggleDate} />
          )}
          {tab === "reminders" && (
            <RemindersPanel
              tasks={tasks}
              onToggleReminder={(id) => {
                const t = tasks.find(t => t.id === id);
                if (t?.reminder) updateTask(id, { reminder: { ...t.reminder, enabled: !t.reminder.enabled } });
              }}
              onUpdateReminder={(id, time, label) => {
                const t = tasks.find(t => t.id === id);
                if (t?.reminder) updateTask(id, { reminder: { ...t.reminder, time, label } });
              }}
            />
          )}
        </main>

        {/* Bottom tab bar */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full flex items-center justify-around border-t"
          style={{
            maxWidth: "430px",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            borderColor: "rgba(0,0,0,0.08)",
            paddingBottom: "env(safe-area-inset-bottom, 8px)",
            paddingTop: "8px",
          }}
        >
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex flex-col items-center gap-1 px-6 py-1 transition-all"
              style={{ color: tab === t.id ? "#3b82f6" : "#c7c7cc" }}
            >
              {t.icon}
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                fontWeight: tab === t.id ? 600 : 400,
              }}>
                {t.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Modals */}
      <AddTaskModal
        open={showAdd}
        groups={groups}
        onClose={() => setShowAdd(false)}
        onAdd={addTask}
      />
      <EditTaskModal
        key={editTask?.id ?? "none"}
        task={editTask}
        groups={groups}
        onClose={() => setEditTask(null)}
        onSave={updateTask}
        onDelete={deleteTask}
      />
    </div>
  );
}
