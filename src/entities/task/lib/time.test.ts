import { describe, expect, it } from "vitest";

import type { Task } from "../model/types";
import {
  getRemainingMinutes,
  getTaskDurationSlots,
  getTaskStartSlot,
  getTaskStatus,
  isThirtyMinuteStep,
  splitMinutes,
} from "./time";

const baseTask: Task = {
  date: "2026-05-01",
  endTime: "10:30",
  id: "task-1",
  startTime: "10:00",
  title: "Test task",
};

describe("task time helpers", () => {
  it("returns pending before task start", () => {
    expect(getTaskStatus(baseTask, new Date("2026-05-01T09:45:00"))).toBe(
      "pending",
    );
  });

  it("returns active during task interval", () => {
    expect(getTaskStatus(baseTask, new Date("2026-05-01T10:15:00"))).toBe(
      "active",
    );
  });

  it("returns done after task end", () => {
    expect(getTaskStatus(baseTask, new Date("2026-05-01T10:30:00"))).toBe(
      "done",
    );
  });

  it("treats tasks from past selected dates as done", () => {
    expect(getTaskStatus(baseTask, new Date("2026-05-02T08:00:00"))).toBe(
      "done",
    );
  });

  it("treats tasks from future selected dates as pending", () => {
    expect(getTaskStatus(baseTask, new Date("2026-04-30T23:00:00"))).toBe(
      "pending",
    );
  });

  it("checks 30-minute steps", () => {
    expect(isThirtyMinuteStep("09:00")).toBe(true);
    expect(isThirtyMinuteStep("09:30")).toBe(true);
    expect(isThirtyMinuteStep("09:15")).toBe(false);
  });

  it("calculates grid placement values", () => {
    expect(getTaskStartSlot(baseTask)).toBe(20);
    expect(getTaskDurationSlots(baseTask)).toBe(1);
  });

  it("calculates remaining minutes", () => {
    expect(getRemainingMinutes(baseTask, new Date("2026-05-01T09:40:00"))).toBe(
      20,
    );
  });

  it("splits minutes into hours and minutes", () => {
    expect(splitMinutes(342)).toEqual({ hours: 5, minutes: 42 });
  });
});
