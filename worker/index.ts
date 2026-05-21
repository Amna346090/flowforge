import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { markRunStarted, markRunFinished } from "../services/workflowRun.service";
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
    await simulateWorkflow(input);
    await markRunFinished(runId, {
      status: "SUCCESS",
      output: { message: "Workflow completed successfully", input: input as Prisma.InputJsonValue },
    });
  },
  { connection }
);

async function simulateWorkflow(_input: unknown): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

worker.on("failed", async (job, err) => {
  if (job?.data?.runId) {
    await markRunFinished(job.data.runId, {
      status: "FAILED",
      error: err.message,
    });
  }
});

console.log("[worker] Listening on queue: workflow-runs");
