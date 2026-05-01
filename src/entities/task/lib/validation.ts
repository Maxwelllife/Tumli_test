import type { Task, TaskDraft } from "../model/types";
import { getMinutesFromTime, isThirtyMinuteStep } from "./time";

export function hasTimeConflict(task: Task, existingTasks: Task[]) {
  const taskStart = getMinutesFromTime(task.startTime);
  const taskEnd = getMinutesFromTime(task.endTime);

  return existingTasks.some((existingTask) => {
    if (existingTask.id === task.id || existingTask.date !== task.date) {
      return false;
    }

    const existingStart = getMinutesFromTime(existingTask.startTime);
    const existingEnd = getMinutesFromTime(existingTask.endTime);

    /**
     * Interval overlap rule:
     * A overlaps B when A starts before B ends and A ends after B starts.
     */
    return taskStart < existingEnd && taskEnd > existingStart;
  });
}

export function validateTaskTimeRange(task: TaskDraft) {
  if (!task.startTime || !task.endTime) {
    return "timeRequired";
  }

  if (
    !isThirtyMinuteStep(task.startTime) ||
    !isThirtyMinuteStep(task.endTime)
  ) {
    return "step";
  }

  const start = getMinutesFromTime(task.startTime);
  const end = getMinutesFromTime(task.endTime);

  if (end <= start) {
    return end === 0 || end < start ? "noCrossDay" : "endAfterStart";
  }

  return null;
}
