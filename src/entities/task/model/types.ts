export type Task = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
};

export type TaskDraft = Omit<Task, "id">;

export type TaskStatus = "pending" | "active" | "done";
