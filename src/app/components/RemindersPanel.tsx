import { useRef, useState } from "react";
import { Bell, BellOff, Download, Upload } from "lucide-react";
import type { Task } from "./types";

interface Props {
  tasks: Task[];
  onToggleReminder: (taskId: string) => void;
  onUpdateReminder: (taskId: string, time: string, label: string) => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onImportJSON: (file: File) => Promise<{ ok: boolean; message: string }>;
  storageError?: string | null;
}

export function RemindersPanel({ tasks, onToggleReminder, onUpdateReminder, onExportJSON, onExportCSV, onImportJSON, storageError }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-importing the same file
    if (!file) return;
    setStatus(await onImportJSON(file));
  }

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

      {/* Data & Backup */}
      <div className="rounded-2xl p-4 mt-2" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 700, color: "#1c1c1e" }}>
          Data &amp; Backup
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#8e8e93", marginTop: "2px", lineHeight: 1.5 }}>
          Your data lives only in this browser. Export a backup regularly so you don't lose it.
        </p>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={onExportJSON}
            className="flex items-center justify-center gap-1.5 flex-1 transition-all active:scale-95"
            style={{ background: "#3b82f6", color: "#fff", borderRadius: "10px", padding: "9px 12px", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600 }}
          >
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-1.5 flex-1 transition-all active:scale-95"
            style={{ background: "#f2f2f7", color: "#1c1c1e", borderRadius: "10px", padding: "9px 12px", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600 }}
          >
            <Upload size={16} /> Import
          </button>
        </div>

        <button
          onClick={onExportCSV}
          className="mt-2 transition-all active:scale-95"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#8e8e93", textDecoration: "underline" }}
        >
          Export CSV (for spreadsheets — can't be re-imported)
        </button>

        <input ref={fileRef} type="file" accept="application/json" onChange={handleFile} style={{ display: "none" }} />

        {status && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", marginTop: "10px", color: status.ok ? "#10b981" : "#ef4444" }}>
            {status.message}
          </p>
        )}
        {storageError && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", marginTop: "8px", color: "#ef4444", lineHeight: 1.5 }}>
            ⚠️ {storageError}
          </p>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
}
