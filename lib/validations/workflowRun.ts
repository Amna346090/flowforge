import { z } from "zod";

export const createWorkflowRunSchema = z.object({
  input: z.json(),
});
