import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useCurrentTime } from "../../app/providers/current-time-context";
import { DeleteTaskModal } from "../../features/delete-task/DeleteTaskModal";
import { LanguageSwitcher } from "../../features/language-switcher/LanguageSwitcher";
import { TaskFormModal } from "../../features/task-form/TaskFormModal";
import {
  formatDateInput,
  formatHumanDate,
  getNextPendingTimeDisplayMode,
  getPendingTimeDisplayMode,
  getSlotTimes,
  savePendingTimeDisplayMode,
  shiftDate,
  type Task,
  type TaskDraft,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAllTasksQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from "../../entities/task";
import { TaskCard } from "../../entities/task/ui/TaskCard";
import { Button } from "../../shared/ui/Button";

type FormState =
  | { mode: "closed" }
  | { initialValues: TaskDraft; mode: "create" }
  | { initialValues: TaskDraft; mode: "edit"; taskId: string };

function getDefaultDraft(date: string, startTime = "09:00"): TaskDraft {
  const [hour, minute] = startTime.split(":").map(Number);
  const endHour = minute === 30 ? hour + 1 : hour;
  const endMinute = minute === 30 ? 0 : 30;

  return {
    date,
    endTime: `${String(endHour).padStart(2, "0")}:${String(
      endMinute,
    ).padStart(2, "0")}`,
    startTime,
    title: "",
  };
}

export function CalendarPage() {
  const { t } = useTranslation();
  const currentTime = useCurrentTime();
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDateInput(new Date()),
  );
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });
  const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null);
  const [pendingTimeDisplayMode, setPendingTimeDisplayMode] = useState(() =>
    getPendingTimeDisplayMode(),
  );
  const slotTimes = useMemo(() => getSlotTimes(), []);

  const { data: tasks = [], isLoading } = useGetTasksQuery(selectedDate);
  const { data: allTasks = [] } = useGetAllTasksQuery();
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const openCreateModal = (startTime?: string) => {
    setFormState({
      initialValues: getDefaultDraft(selectedDate, startTime),
      mode: "create",
    });
  };

  const openEditModal = (task: Task) => {
    setFormState({
      initialValues: {
        date: task.date,
        endTime: task.endTime,
        startTime: task.startTime,
        title: task.title,
      },
      mode: "edit",
      taskId: task.id,
    });
  };

  const closeForm = () => setFormState({ mode: "closed" });

  const submitForm = async (values: TaskDraft) => {
    if (formState.mode === "create") {
      await createTask(values).unwrap();
    }

    if (formState.mode === "edit") {
      await updateTask({ ...values, id: formState.taskId }).unwrap();
    }

    setSelectedDate(values.date);
    closeForm();
  };

  const confirmDelete = async () => {
    if (!taskPendingDelete) {
      return;
    }

    await deleteTask({
      date: taskPendingDelete.date,
      id: taskPendingDelete.id,
    }).unwrap();

    setTaskPendingDelete(null);
    closeForm();
  };

  const togglePendingTimeDisplay = () => {
    setPendingTimeDisplayMode((currentMode) => {
      const nextMode = getNextPendingTimeDisplayMode(currentMode);
      savePendingTimeDisplayMode(nextMode);

      return nextMode;
    });
  };

  return (
    <main className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-ink-950 sm:text-3xl">
                {t("app.title")}
              </h1>
              <p className="mt-1 text-sm text-ink-600">{t("app.subtitle")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LanguageSwitcher />
              <Button onClick={() => openCreateModal()} type="button" variant="primary">
                <Plus aria-hidden size={17} />
                {t("actions.createTask")}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                aria-label={t("actions.previousDay")}
                onClick={() => setSelectedDate((date) => shiftDate(date, -1))}
                type="button"
              >
                <ChevronLeft aria-hidden size={17} />
              </Button>
              <input
                aria-label={t("calendar.selectedDate")}
                className="field-input max-w-44"
                onChange={(event) => setSelectedDate(event.target.value)}
                type="date"
                value={selectedDate}
              />
              <Button
                aria-label={t("actions.nextDay")}
                onClick={() => setSelectedDate((date) => shiftDate(date, 1))}
                type="button"
              >
                <ChevronRight aria-hidden size={17} />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-600">
              <Button
                onClick={() => setSelectedDate(formatDateInput(new Date()))}
                type="button"
              >
                {t("actions.today")}
              </Button>
              <span>{formatHumanDate(selectedDate)}</span>
              <span aria-hidden>·</span>
              <span>{t("calendar.totalTasks", { count: tasks.length })}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-sm text-ink-600">{t("calendar.loading")}</p>
        ) : (
          <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] grid-rows-[repeat(48,minmax(2rem,auto))] rounded-lg border border-line bg-white">
            {slotTimes.map((time, index) => {
              const isHour = time.endsWith(":00");

              return (
                <button
                  className="group contents"
                  key={time}
                  onClick={() => openCreateModal(time)}
                  type="button"
                >
                  <span className="border-b border-line/70 px-2 py-2 text-right text-xs text-ink-600">
                    {isHour ? time : ""}
                  </span>
                  <span
                    className="border-b border-line/70 px-3 py-2 text-left text-xs text-ink-600 transition group-hover:bg-accent/5"
                    style={{
                      gridColumn: "2",
                      gridRow: index + 1,
                    }}
                  >
                    <span className="opacity-0 transition group-hover:opacity-100">
                      {t("calendar.emptySlot")}
                    </span>
                  </span>
                </button>
              );
            })}

            {tasks.map((task) => (
              <TaskCard
                currentTime={currentTime}
                key={task.id}
                onDelete={setTaskPendingDelete}
                onEdit={openEditModal}
                onTogglePendingTimeDisplay={togglePendingTimeDisplay}
                pendingTimeDisplayMode={pendingTimeDisplayMode}
                task={task}
              />
            ))}
          </div>
        )}
      </section>

      {formState.mode !== "closed" ? (
        <TaskFormModal
          existingTasks={allTasks}
          initialValues={formState.initialValues}
          isOpen
          mode={formState.mode}
          onClose={closeForm}
          onDelete={
            formState.mode === "edit"
              ? () => {
                  const task = tasks.find(({ id }) => id === formState.taskId);

                  if (task) {
                    setTaskPendingDelete(task);
                  }
                }
              : undefined
          }
          onSubmit={submitForm}
          taskId={formState.mode === "edit" ? formState.taskId : undefined}
        />
      ) : null}

      <DeleteTaskModal
        isOpen={Boolean(taskPendingDelete)}
        onClose={() => setTaskPendingDelete(null)}
        onConfirm={confirmDelete}
        taskTitle={taskPendingDelete?.title}
      />
    </main>
  );
}
