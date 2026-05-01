import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

import { tasksStorage } from "./tasks-storage";
import type { Task, TaskDraft } from "../model/types";

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    getAllTasks: builder.query<Task[], void>({
      queryFn: () => ({ data: tasksStorage.getAll() }),
      providesTags: [{ type: "Task", id: "LIST" }],
    }),
    getTasks: builder.query<Task[], string>({
      queryFn: (date) => ({ data: tasksStorage.getByDate(date) }),
      providesTags: (_result, _error, date) => [
        { type: "Task", id: "LIST" },
        { type: "Task", id: date },
      ],
    }),
    createTask: builder.mutation<Task, TaskDraft>({
      queryFn: (draft) => ({ data: tasksStorage.create(draft) }),
      invalidatesTags: (_result, _error, draft) => [
        { type: "Task", id: "LIST" },
        { type: "Task", id: draft.date },
      ],
    }),
    updateTask: builder.mutation<Task, Task>({
      queryFn: (task) => ({ data: tasksStorage.update(task) }),
      invalidatesTags: (_result, _error, task) => [
        { type: "Task", id: "LIST" },
        { type: "Task", id: task.date },
      ],
    }),
    deleteTask: builder.mutation<string, { id: string; date: string }>({
      queryFn: ({ id }) => ({ data: tasksStorage.delete(id) }),
      invalidatesTags: (_result, _error, { date }) => [
        { type: "Task", id: "LIST" },
        { type: "Task", id: date },
      ],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAllTasksQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
} = tasksApi;
