import { Bell, BellOff, Clock } from "lucide-react";
import type { Task } from "./types";

interface Props {
  tasks: Task[];
  onToggleReminder: (taskId: string) => void;
  onUpdateReminder: (taskId: string, time: string, label: string) => void;
}

export function RemindersPanel({ tasks, onToggleReminder, onUpdateReminder }: Props) {
  const withReminders = tasks.filter(t => t.reminder);
  const active = withReminders.filter(t => t.reminder?.enabled);

  const inputStyle: React.CSSProperties = {
    background: "#f2f2f7",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "8px",
    color: "#1c1c1e",
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
    padding: "7px 10px",
    outline: "none",
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Summary */}
      <div className="flex items-center gap-2 px-1 pb-2">
        <Bell size={14} style={{ color: "#3b82f6" }} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#8e8e93" }}>
          {active.length} active reminder{active.length !== 1 ? "s" : ""}
        </span>
      </div>

      {withReminders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <BellOff size={40} style={{ color: "#c7c7cc" }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#8e8e93", textAlign: "center" }}>
            No reminders set.{"\n"}Add one when creating or editing a task.
          </p>
        </div>
      )}

      {withReminders
        .sort((a, b) => (a.reminder!.time > b.reminder!.time ? 1 : -1))
        .map(task => {
          const r = task.reminder!;
          return (
            <div
              key={task.id}
              className="rounded-2xl p-4"
              style={{
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                borderLeft: `4px solid ${r.enabled ? "#3b82f6" : "#e5e5ea"}`,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span style={{ fontSize: "22px" }}>{task.emoji}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "20px", fontWeight: 700, color: r.enabled ? "#3b82f6" : "#c7c7cc" }}>
                      {r.time}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, color: "#1c1c1e" }}>
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <input
                      type="time"
                      value={r.time}
                      onChange={e => onUpdateReminder(task.id, e.target.value, r.label)}
                      style={{ ...inputStyle, flexShrink: 0 }}
                    />
                    <input
                      value={r.label}
                      onChange={e => onUpdateReminder(task.id, r.time, e.target.value)}
                      placeholder="Message"
                      style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => onToggleReminder(task.id)}
                  className="shrink-0 transition-all active:scale-90"
                  title={r.enabled ? "Disable" : "Enable"}
                >
                  {r.enabled
                    ? <Bell size={20} style={{ color: "#3b82f6" }} />
                    : <BellOff size={20} style={{ color: "#c7c7cc" }} />
                  }
                </button>
              </div>
            </div>
          );
        })}

      <div
        className="rounded-2xl p-4 mt-2"
        style={{ background: "#eff6ff" }}
      >
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#3b82f6", lineHeight: 1.6 }}>
          💡 Reminders are saved locally. Browser push notifications coming soon.
        </p>
      </div>

      <div className="h-4" />
    </div>
  );
}
