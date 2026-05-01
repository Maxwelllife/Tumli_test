import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  getTimeOptions,
  hasTimeConflict,
  type Task,
  type TaskDraft,
} from "../../entities/task";
import { Button } from "../../shared/ui/Button";
import { cn } from "../../shared/lib/cn";
import { Modal } from "../../shared/ui/Modal";
import { taskFormSchema, type TaskFormValues } from "./task-form-schema";

type TaskFormModalProps = {
  existingTasks: Task[];
  initialValues: TaskDraft;
  isOpen: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onDelete?: () => void;
  onSubmit: (values: TaskDraft) => void;
  taskId?: string;
};

export function TaskFormModal({
  existingTasks,
  initialValues,
  isOpen,
  mode,
  onClose,
  onDelete,
  onSubmit,
  taskId,
}: TaskFormModalProps) {
  const { t } = useTranslation();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const timeOptions = useMemo(() => getTimeOptions(), []);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<TaskFormValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(taskFormSchema),
    values: initialValues,
  });
  const titleRegistration = register("title");

  const submitForm = (values: TaskFormValues) => {
    const taskToValidate: Task = {
      ...values,
      id: taskId ?? "new-task",
    };

    if (hasTimeConflict(taskToValidate, existingTasks)) {
      setError("endTime", { message: "conflict" });
      return;
    }

    onSubmit(values);
  };

  const getErrorText = (message?: string) => {
    return message ? t(`validation.${message}`) : null;
  };

  const getInputClassName = (hasError: boolean) =>
    cn(
      "field-input",
      hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
    );

  const renderFieldError = (message?: string) => (
    <span className="field-error block min-h-5">
      {message ? getErrorText(message) : ""}
    </span>
  );

  return (
    <Modal
      initialFocusRef={titleInputRef}
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? t("form.createTitle") : t("form.editTitle")}
    >
      <form className="space-y-4" onSubmit={handleSubmit(submitForm)}>
        <label className="block space-y-1.5">
          <span className="field-label">{t("form.title")}</span>
          <input
            aria-invalid={Boolean(errors.title)}
            className={getInputClassName(Boolean(errors.title))}
            placeholder={t("form.titlePlaceholder")}
            {...titleRegistration}
            ref={(element) => {
              titleRegistration.ref(element);
              titleInputRef.current = element;
            }}
          />
          {renderFieldError(errors.title?.message)}
        </label>

        <label className="block space-y-1.5">
          <span className="field-label">{t("form.date")}</span>
          <input
            aria-invalid={Boolean(errors.date)}
            className={getInputClassName(Boolean(errors.date))}
            type="date"
            {...register("date")}
          />
          {renderFieldError(errors.date?.message)}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="field-label">{t("form.startTime")}</span>
            <select
              aria-invalid={Boolean(errors.startTime)}
              className={getInputClassName(Boolean(errors.startTime))}
              {...register("startTime")}
            >
              {timeOptions.slice(0, -1).map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {renderFieldError(errors.startTime?.message)}
          </label>

          <label className="block space-y-1.5">
            <span className="field-label">{t("form.endTime")}</span>
            <select
              aria-invalid={Boolean(errors.endTime)}
              className={getInputClassName(Boolean(errors.endTime))}
              {...register("endTime")}
            >
              {timeOptions.slice(1).map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {renderFieldError(errors.endTime?.message)}
          </label>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
          {mode === "edit" && onDelete ? (
            <Button onClick={onDelete} type="button" variant="ghost">
              <Trash2 aria-hidden size={16} />
              {t("actions.delete")}
            </Button>
          ) : (
            <span />
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button onClick={onClose} type="button" variant="secondary">
              {t("actions.cancel")}
            </Button>
            <Button disabled={isSubmitting} type="submit" variant="primary">
              {mode === "create" ? t("actions.create") : t("actions.save")}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
