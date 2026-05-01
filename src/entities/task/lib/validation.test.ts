import { describe, expect, it } from "vitest";

import type { Task, TaskDraft } from "../model/types";
import { hasTimeConflict, validateTaskTimeRange } from "./validation";

const existingTasks: Task[] = [
  {
    date: "2026-05-01",
    endTime: "11:00",
    id: "task-1",
    startTime: "10:00",
    title: "Existing task",
  },
];

describe("task validation helpers", () => {
  it("detects overlapping intervals", () => {
    expect(
      hasTimeConflict(
        {
          date: "2026-05-01",
          endTime: "10:30",
          id: "task-2",
          startTime: "09:30",
          title: "Overlap",
        },
        existingTasks,
      ),
    ).toBe(true);
  });

  it("allows touching intervals", () => {
    expect(
      hasTimeConflict(
        {
          date: "2026-05-01",
          endTime: "11:30",
          id: "task-2",
          startTime: "11:00",
          title: "No overlap",
        },
        existingTasks,
      ),
    ).toBe(false);
  });

  it("ignores the same task during edit", () => {
    expect(
      hasTimeConflict(
        {
          ...existingTasks[0],
          title: "Edited title",
        },
        existingTasks,
      ),
    ).toBe(false);
  });

  it("validates a correct 30-minute range", () => {
    const draft: TaskDraft = {
      date: "2026-05-01",
      endTime: "09:30",
      startTime: "09:00",
      title: "Valid",
    };

    expect(validateTaskTimeRange(draft)).toBeNull();
  });

  it("rejects non-30-minute steps", () => {
    const draft: TaskDraft = {
      date: "2026-05-01",
      endTime: "09:45",
      startTime: "09:15",
      title: "Invalid",
    };

    expect(validateTaskTimeRange(draft)).toBe("step");
  });

  it("rejects cross-day ranges", () => {
    const draft: TaskDraft = {
      date: "2026-05-01",
      endTime: "00:30",
      startTime: "23:30",
      title: "Too late",
    };

    expect(validateTaskTimeRange(draft)).toBe("noCrossDay");
  });
});
