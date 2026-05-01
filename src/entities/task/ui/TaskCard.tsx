import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  getRemainingMinutes,
  getTaskDurationSlots,
  getTaskStartSlot,
  getTaskStatus,
  type PendingTimeDisplayMode,
  splitMinutes,
  type Task,
} from "..";
import { cn } from "../../../shared/lib/cn";

type TaskCardProps = {
  currentTime: Date;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onTogglePendingTimeDisplay: () => void;
  pendingTimeDisplayMode: PendingTimeDisplayMode;
  task: Task;
};

export function TaskCard({
  currentTime,
  onDelete,
  onEdit,
  onTogglePendingTimeDisplay,
  pendingTimeDisplayMode,
  task,
}: TaskCardProps) {
  const { t } = useTranslation();
  const status = getTaskStatus(task, currentTime);
  const remainingMinutes = getRemainingMinutes(task, currentTime);
  const remainingTime = splitMinutes(remainingMinutes);
  const startSlot = getTaskStartSlot(task);
  const durationSlots = getTaskDurationSlots(task);

  const pendingStatusLabel =
    pendingTimeDisplayMode === "totalMinutes" || remainingTime.hours === 0
      ? t("status.pendingMinutesOnly", { minutes: remainingMinutes })
      : t("status.pendingHoursMinutes", {
          hours: remainingTime.hours,
          minutes: remainingTime.minutes,
        });

  const statusLabel =
    status === "pending"
      ? pendingStatusLabel
      : status === "active"
        ? t("status.active")
        : `${task.startTime}-${task.endTime}`;

  const openTask = () => onEdit(task);

  return (
    <article
      className={cn(
        "group relative z-10 m-1 flex min-h-16 cursor-pointer flex-col justify-between",
        "rounded-md border p-3 shadow-soft transition hover:-translate-y-0.5",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper",
        status === "pending" && "border-line bg-white",
        status === "active" && "border-accent bg-emerald-50",
        status === "done" && "border-zinc-200 bg-zinc-100 text-ink-600",
      )}
      onClick={openTask}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openTask();
        }
      }}
      role="button"
      style={{
        gridColumn: "2",
        gridRow: `${startSlot + 1} / span ${durationSlots}`,
      }}
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-left">
          <h3 className="truncate text-sm font-semibold text-ink-950">
            {task.title}
          </h3>
          <p className="mt-1 text-xs text-ink-600">
            {task.startTime}-{task.endTime}
          </p>
        </div>

        <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <button
            aria-label={t("actions.edit")}
            className="rounded-md p-1.5 text-ink-600 hover:bg-black/[0.06] focus:outline-none focus:ring-2 focus:ring-accent"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(task);
            }}
            type="button"
          >
            <Pencil aria-hidden size={15} />
          </button>
          <button
            aria-label={t("actions.delete")}
            className="rounded-md p-1.5 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(task);
            }}
            type="button"
          >
            <Trash2 aria-hidden size={15} />
          </button>
        </div>
      </div>

      <button
        aria-label={
          status === "pending" ? t("status.toggleTimeDisplay") : statusLabel
        }
        className={cn(
          "status-badge mt-3 w-fit cursor-default focus:outline-none focus:ring-2 focus:ring-accent",
          status === "pending" && "cursor-pointer hover:bg-amber-200",
          status === "pending" && "bg-amber-100 text-amber-900",
          status === "active" && "bg-emerald-100 text-emerald-900",
          status === "done" && "bg-zinc-200 text-zinc-700",
        )}
        onClick={(event) => {
          event.stopPropagation();

          if (status === "pending") {
            onTogglePendingTimeDisplay();
          }
        }}
        type="button"
      >
        {statusLabel}
      </button>
    </article>
  );
}
