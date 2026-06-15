import { useState } from "react";
import { X, Bell, Hash, Trash2 } from "lucide-react";
import type { Priority, Task } from "./types";

interface Props {
  task: Task | null;
  groups: string[];
  onClose: () => void;
  onSave: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const EMOJI_OPTIONS = ["📋", "💼", "🚀", "🎯", "💪", "🧘", "🏃", "📧", "📚", "🎨", "🔧", "💡", "🏋", "⚡", "🌟"];

export function EditTaskModal({ task, groups, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium");
  const [group, setGroup] = useState(task?.group ?? "");
  const [customGroup, setCustomGroup] = useState(
    task && !groups.includes(task.group) ? task.group : ""
  );
  const [emoji, setEmoji] = useState(task?.emoji ?? "📋");
  const [isCountable, setIsCountable] = useState(task?.isCountable ?? false);
  const [goal, setGoal] = useState(task?.goal?.toString() ?? "");
  const [sets, setSets] = useState(task?.sets?.toString() ?? "");
  const [hasReminder, setHasReminder] = useState(!!task?.reminder);
  const [reminderTime, setReminderTime] = useState(task?.reminder?.time ?? "09:00");
  const [reminderLabel, setReminderLabel] = useState(task?.reminder?.label ?? "");

  if (!task) return null;

  const finalGroup = customGroup.trim() || group;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !finalGroup) return;
    onSave(task!.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      group: finalGroup.toUpperCase(),
      emoji,
      isCountable,
      goal: isCountable && goal ? Number(goal) : undefined,
      sets: isCountable && sets ? Number(sets) : undefined,
      reminder: hasReminder
        ? {
            id: task!.reminder?.id ?? Date.now().toString(),
            time: reminderTime,
            label: reminderLabel || title,
            enabled: task!.reminder?.enabled ?? true,
          }
        : undefined,
    });
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    background: "#f2f2f7",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "10px",
    color: "#1c1c1e",
    fontFamily: "'Inter', sans-serif",
    fontSize: "15px",
    padding: "10px 14px",
    outline: "none",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    fontWeight: 600,
    color: "#8e8e93",
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div
      className="fixed inset-0 flex items-end justify-center z-50"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-t-2xl overflow-y-auto"
        style={{ background: "#ffffff", maxHeight: "92vh", paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "#e5e5ea" }} />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "17px", fontWeight: 600, color: "#1c1c1e" }}>
            Edit Task
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { onDelete(task.id); onClose(); }}
              style={{ color: "#ff3b30" }}
            >
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} style={{ color: "#8e8e93" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 pb-6">
          {/* Emoji picker */}
          <div>
            <span style={labelStyle}>Icon</span>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                  style={{
                    background: emoji === e ? "#eff6ff" : "#f2f2f7",
                    border: emoji === e ? "2px solid #3b82f6" : "2px solid transparent",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <span style={labelStyle}>Title *</span>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <span style={labelStyle}>Description</span>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>

          {/* Group */}
          <div>
            <span style={labelStyle}>Group *</span>
            {groups.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {groups.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { setGroup(g); setCustomGroup(""); }}
                    className="px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      fontWeight: 500,
                      background: group === g && !customGroup ? "#eff6ff" : "#f2f2f7",
                      color: group === g && !customGroup ? "#3b82f6" : "#6b7280",
                      border: group === g && !customGroup ? "1px solid #bfdbfe" : "1px solid transparent",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
            <input
              value={customGroup}
              onChange={e => { setCustomGroup(e.target.value); if (e.target.value) setGroup(""); }}
              placeholder="Or type a new group name..."
              style={inputStyle}
            />
          </div>

          {/* Priority */}
          <div>
            <span style={labelStyle}>Priority</span>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className="flex-1 py-2 rounded-xl capitalize transition-all"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 500,
                    background: priority === p
                      ? p === "high" ? "#fef2f2" : p === "medium" ? "#fffbeb" : "#f0fdf4"
                      : "#f2f2f7",
                    color: priority === p
                      ? p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#22c55e"
                      : "#8e8e93",
                    border: priority === p ? "1px solid currentColor" : "1px solid transparent",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Countable toggle */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash size={15} style={{ color: isCountable ? "#3b82f6" : "#8e8e93" }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#1c1c1e" }}>
                  Count-based task
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCountable(v => !v)}
                className="w-12 h-6 rounded-full transition-all relative"
                style={{ background: isCountable ? "#3b82f6" : "#e5e5ea" }}
              >
                <div
                  className="w-5 h-5 rounded-full absolute top-0.5 transition-all"
                  style={{ background: "#fff", left: isCountable ? "26px" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                />
              </button>
            </div>
            {isCountable && (
              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <span style={labelStyle}>{sets ? "Reps per set" : "Goal (target count)"}</span>
                  <input
                    type="number"
                    min="1"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    placeholder="e.g. 20"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <span style={labelStyle}>Sets (number of sets)</span>
                  <input
                    type="number"
                    min="1"
                    value={sets}
                    onChange={e => setSets(e.target.value)}
                    placeholder="Optional — e.g. 3"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reminder */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={15} style={{ color: hasReminder ? "#3b82f6" : "#8e8e93" }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#1c1c1e" }}>
                  Reminder
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasReminder(v => !v)}
                className="w-12 h-6 rounded-full transition-all relative"
                style={{ background: hasReminder ? "#3b82f6" : "#e5e5ea" }}
              >
                <div
                  className="w-5 h-5 rounded-full absolute top-0.5 transition-all"
                  style={{ background: "#fff", left: hasReminder ? "26px" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                />
              </button>
            </div>
            {hasReminder && (
              <div className="flex gap-2 mt-3">
                <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
                  style={{ ...inputStyle, width: "auto", flexShrink: 0 }} />
                <input value={reminderLabel} onChange={e => setReminderLabel(e.target.value)}
                  placeholder="Message" style={inputStyle} />
              </div>
            )}
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={!title.trim() || !finalGroup}
            className="w-full py-3.5 rounded-xl transition-all active:scale-98 disabled:opacity-40"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 600, background: "#3b82f6", color: "#fff" }}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
