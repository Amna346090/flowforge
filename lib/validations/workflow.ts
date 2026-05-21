import { z } from "zod";

export const createWorkflowSchema = z.object({
  name: z.string().min(1, "name is required").max(100),
  definition: z.json().optional(),
});

export const updateWorkflowSchema = z
  .object({
    name: z.string().min(1, "name is required").max(100).optional(),
    definition: z.json().optional(),
  })
  .refine((data) => data.name !== undefined || data.definition !== undefined, {
    message: "at least one field is required",
  });
