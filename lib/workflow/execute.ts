import type { WorkflowDefinition } from "./definition";

export type WorkflowExecutionResult = {
  prompt: string;
  input: unknown;
  message: string;
};

export function executeWorkflow(
  definition: WorkflowDefinition,
  input: unknown
): WorkflowExecutionResult {
  return {
    prompt: definition.prompt,
    input,
    message: `Executed workflow with prompt: ${definition.prompt}`,
  };
}
