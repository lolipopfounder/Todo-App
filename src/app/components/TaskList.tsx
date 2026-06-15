import { CheckCircle2, Circle, Minus, Plus, Pencil } from "lucide-react";
import type { Task } from "./types";
import { dailyUnits, dailyTotal } from "./store";

interface Props {
  tasks: Task[];
  today: string;
  groups: string[];
  onToggle: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, today, groups, onToggle, onIncrement, onDecrement, onEdit, onDelete }: Props) {
  const todayTasks = tasks.filter(t => t.createdAt <= today);
  const completedToday = todayTasks.filter(t => t.completedDates.includes(today)).length;

  // Group tasks
  const grouped: Record<string, Task[]> = {};
  for (const g of groups) {
    const groupTasks = todayTasks.filter(t => t.group === g);
    if (groupTasks.length > 0) grouped[g] = groupTasks;
  }
  // Tasks without known groups (shouldn't happen but be safe)
  const ungrouped = todayTasks.filter(t => !groups.includes(t.group));
  if (ungrouped.length > 0) grouped["OTHER"] = ungrouped;

  return (
    <div className="flex flex-col gap-1">
      {/* Progress summary */}
      <div className="flex items-center justify-between px-1 pb-3">
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#8e8e93" }}>
          {completedToday} of {todayTasks.length} completed today
        </span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background: "#e5e5ea" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: todayTasks.length ? `${(completedToday / todayTasks.length) * 100}%` : "0%",
                background: "#3b82f6",
              }}
            />
          </div>
        </div>
      </div>

      {Object.entries(grouped).map(([group, groupTasks]) => (
        <div key={group} className="mb-2">
          {/* Group header */}
          <div className="px-1 pb-2 pt-1">
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              color: "#8e8e93",
              letterSpacing: "0.06em",
            }}>
              {group}
            </span>
          </div>

          {/* Task cards */}
          <div className="flex flex-col gap-2">
            {groupTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                today={today}
                onToggle={onToggle}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}

      {todayTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <span style={{ fontSize: "40px" }}>📋</span>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#8e8e93" }}>
            No tasks yet. Tap + to add one.
          </p>
        </div>
      )}
    </div>
  );
}

interface CardProps {
  task: Task;
  today: string;
  onToggle: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

function TaskCard({ task, today, onToggle, onIncrement, onDecrement, onEdit, onDelete }: CardProps) {
  const done = task.completedDates.includes(today);
  const units = dailyUnits(task, today);
  const reachedGoal = task.isCountable && (
    task.sets !== undefined
      ? units >= task.sets
      : task.goal !== undefined && units >= task.goal
  );
  const isComplete = done || reachedGoal;

  return (
    <div
      className="rounded-xl flex items-stretch overflow-hidden"
      style={{
        background: isComplete ? "#f0fdf4" : "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
        borderLeft: `4px solid ${isComplete ? "#22c55e" : task.color}`,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="flex items-center justify-center pl-3 pr-2 py-3 shrink-0 transition-all active:scale-90"
        style={{ color: isComplete ? "#22c55e" : "#d1d5db" }}
      >
        {isComplete
          ? <CheckCircle2 size={22} fill="#22c55e" color="#fff" />
          : <Circle size={22} />
        }
      </button>

      {/* Content — tappable to edit */}
      <button
        className="flex-1 text-left py-3 pr-2 min-w-0"
        onClick={() => onEdit(task)}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span style={{ fontSize: "16px", lineHeight: 1 }}>{task.emoji}</span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              fontWeight: 500,
              color: isComplete ? "#6b7280" : "#1c1c1e",
              textDecoration: isComplete ? "line-through" : "none",
            }}
          >
            {task.title}
          </span>
        </div>

        {/* Goal / count line */}
        {task.isCountable && task.goal !== undefined && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: isComplete ? "#22c55e" : "#8e8e93", marginTop: "2px" }}>
            {task.sets !== undefined
              ? `${isComplete ? "✓ " : ""}${units} / ${task.sets} sets · ${dailyTotal(task, today)} reps`
              : isComplete
                ? `✓ Done! (${units} / ${task.goal})`
                : `${units} / ${task.goal} goal`
            }
          </p>
        )}

        {/* Description */}
        {task.description && (
          <div className="mt-1">
            {task.description.split("\n").map((line, i) => (
              <p key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#8e8e93", lineHeight: "1.5" }}>
                {i === 0 ? line : `${line}`}
              </p>
            ))}
          </div>
        )}

        {/* Reminder badge */}
        {task.reminder?.enabled && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#3b82f6", marginTop: "3px" }}>
            ⏰ {task.reminder.time} — {task.reminder.label}
          </p>
        )}
      </button>

      {/* Right side: count buttons or delete */}
      <div className="flex items-center shrink-0 gap-1 pr-3">
        {task.isCountable ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDecrement(task.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: "#f2f2f7", color: "#6b7280" }}
            >
              <Minus size={14} />
            </button>
            <span
              className="w-7 text-center"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 600, color: "#1c1c1e" }}
            >
              {units}
            </span>
            <button
              onClick={() => onIncrement(task.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: "#f2f2f7", color: "#6b7280" }}
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onEdit(task)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: "#f2f2f7", color: "#c7c7cc" }}
          >
            <Pencil size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
