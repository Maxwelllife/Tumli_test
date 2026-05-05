import { z } from "zod";

import { isValidDateInput, validateTaskTimeRange } from "../../entities/task";

export const taskFormSchema = z
  .object({
    date: z
      .string()
      .min(1, "dateRequired")
      .refine(isValidDateInput, "dateInvalid"),
    endTime: z.string().min(1, "timeRequired"),
    startTime: z.string().min(1, "timeRequired"),
    title: z.string().trim().min(1, "requiredTitle"),
  })
  .superRefine((value, context) => {
    const errorKey = validateTaskTimeRange(value);

    if (!errorKey) {
      return;
    }

    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: errorKey,
      path: ["endTime"],
    });
  });

export type TaskFormValues = z.infer<typeof taskFormSchema>;
