import seedTasks from "./tasks.seed.json";
import type { Task, TaskDraft } from "../model/types";

const STORAGE_KEY = "task-calendar:v1";

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    return a.startTime.localeCompare(b.startTime);
  });
}

function readAllTasks() {
  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    const initialTasks = seedTasks as Task[];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));

    return initialTasks;
  }

  try {
    return JSON.parse(storedValue) as Task[];
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTasks));

    return seedTasks as Task[];
  }
}

function writeAllTasks(tasks: Task[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortTasks(tasks)));
}

export const tasksStorage = {
  getAll() {
    return sortTasks(readAllTasks());
  },

  getByDate(date: string) {
    return sortTasks(readAllTasks()).filter((task) => task.date === date);
  },

  create(draft: TaskDraft) {
    const tasks = readAllTasks();
    const task: Task = {
      ...draft,
      id: crypto.randomUUID(),
    };

    writeAllTasks([...tasks, task]);

    return task;
  },

  update(task: Task) {
    const tasks = readAllTasks();
    const updatedTasks = tasks.map((currentTask) =>
      currentTask.id === task.id ? task : currentTask,
    );

    writeAllTasks(updatedTasks);

    return task;
  },

  delete(id: string) {
    const tasks = readAllTasks();

    writeAllTasks(tasks.filter((task) => task.id !== id));

    return id;
  },
};
