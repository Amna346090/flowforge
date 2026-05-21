import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { markRunStarted, markRunFinished } from "../services/workflowRun.service";
import { getWorkflowForExecution } from "../services/workflow.service";
import { parseWorkflowDefinition } from "../lib/workflow/definition";
import { executeWorkflow } from "../lib/workflow/execute";
import type { WorkflowJobData } from "../lib/queue";
import type { Prisma } from "../generated/prisma/client";

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

const worker = new Worker<WorkflowJobData>(
  "workflow-runs",
  async (job) => {
    const { runId, workflowId, input } = job.data;

    await markRunStarted(runId);

    const workflow = await getWorkflowForExecution(workflowId);
    const definition = parseWorkflowDefinition(workflow.definition);
    const result = executeWorkflow(definition, input);

    await markRunFinished(runId, {
      status: "SUCCESS",
      output: result as Prisma.InputJsonValue,
    });
  },
  { connection }
);

worker.on("failed", async (job, err) => {
  if (job?.data?.runId) {
    await markRunFinished(job.data.runId, {
      status: "FAILED",
      error: err.message,
    });
  }
});

console.log("[worker] Listening on queue: workflow-runs");
