import { z } from "zod";

export const workflowInputFieldSchema = z.object({
  key: z
    .string()
    .min(1, "key is required")
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "key must start with a letter"),
  label: z.string().min(1, "label is required"),
  type: z.enum(["text", "email"]).default("text"),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
});

export const workflowDefinitionSchema = z.object({
  prompt: z.string().min(1, "prompt is required"),
  inputFields: z.array(workflowInputFieldSchema).default([]),
});

export type WorkflowInputField = z.infer<typeof workflowInputFieldSchema>;
export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

export const DEFAULT_WORKFLOW_DEFINITION: WorkflowDefinition = {
  prompt: "You are a helpful assistant. Respond to the user input.",
  inputFields: [],
};

export function parseWorkflowDefinition(value: unknown): WorkflowDefinition {
  if (
    value &&
    typeof value === "object" &&
    Object.keys(value as object).length === 0
  ) {
    return DEFAULT_WORKFLOW_DEFINITION;
  }

  return workflowDefinitionSchema.parse(value);
}

export function buildRunInput(
  fields: WorkflowInputField[],
  values: Record<string, string>
): Record<string, string> {
  const input: Record<string, string> = {};

  for (const field of fields) {
    const trimmed = values[field.key]?.trim() ?? "";
    if (trimmed || field.required) {
      input[field.key] = trimmed;
    }
  }

  return input;
}
