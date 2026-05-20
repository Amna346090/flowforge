import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const workflowQueue = new Queue("workflow-runs", { connection });

export type WorkflowJobData = {
  runId: string;
  workflowId: string;
  workspaceId: string;
  input: unknown;
};
