import {
  addDays,
  differenceInMinutes,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parse,
  startOfDay,
} from "date-fns";

import type { Task, TaskStatus } from "../model/types";

export const SLOT_STEP_MINUTES = 30;
export const SLOTS_PER_DAY = 24 * (60 / SLOT_STEP_MINUTES);

export function formatDateInput(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function shiftDate(date: string, amount: number) {
  return formatDateInput(addDays(parseDate(date), amount));
}

export function parseDate(date: string) {
  return parse(date, "yyyy-MM-dd", new Date());
}

export function parseTaskDateTime(date: string, time: string) {
  return parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
}

export function formatHumanDate(date: string) {
  return format(parseDate(date), "EEE, MMM d");
}

export function getMinutesFromTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

export function isThirtyMinuteStep(time: string) {
  const [, minutes] = time.split(":").map(Number);

  return minutes % SLOT_STEP_MINUTES === 0;
}

export function isPastDate(date: string, now: Date) {
  return isBefore(startOfDay(parseDate(date)), startOfDay(now));
}

export function isFutureDate(date: string, now: Date) {
  return isAfter(startOfDay(parseDate(date)), startOfDay(now));
}

export function getTaskStatus(task: Task, now: Date): TaskStatus {
  if (isPastDate(task.date, now)) {
    return "done";
  }

  if (isFutureDate(task.date, now)) {
    return "pending";
  }

  const taskStart = parseTaskDateTime(task.date, task.startTime);
  const taskEnd = parseTaskDateTime(task.date, task.endTime);

  if (isBefore(now, taskStart)) {
    return "pending";
  }

  if (isBefore(now, taskEnd)) {
    return "active";
  }

  return "done";
}

export function getRemainingMinutes(task: Task, now: Date) {
  const taskStart = parseTaskDateTime(task.date, task.startTime);

  return Math.max(0, differenceInMinutes(taskStart, now));
}

export function splitMinutes(totalMinutes: number) {
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

export function getTaskDurationSlots(task: Pick<Task, "startTime" | "endTime">) {
  const durationMinutes =
    getMinutesFromTime(task.endTime) - getMinutesFromTime(task.startTime);

  return Math.max(1, durationMinutes / SLOT_STEP_MINUTES);
}

export function getTaskStartSlot(task: Pick<Task, "startTime">) {
  return getMinutesFromTime(task.startTime) / SLOT_STEP_MINUTES;
}

export function getTimeOptions() {
  return Array.from({ length: SLOTS_PER_DAY + 1 }, (_, index) => {
    const totalMinutes = index * SLOT_STEP_MINUTES;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  });
}

export function getSlotTimes() {
  return getTimeOptions().slice(0, -1);
}

export function isToday(date: string, now: Date) {
  return isSameDay(parseDate(date), now);
}
