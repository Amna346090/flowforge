import { WorkflowRunStatus, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

async function assertMembership(userId: string, workspaceId: string) {
  const membership = await db.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!membership) {
    throw new Error("Not authorized to access this workspace");
  }

  return membership;
}

// ── User-facing functions (RBAC enforced) ─────────────────────────────────────

export async function createWorkflowRun(
  userId: string,
  data: {
    workflowId: string;
    workspaceId: string;
    input: Prisma.InputJsonValue;
  }
) {
  await assertMembership(userId, data.workspaceId);

  return db.workflowRun.create({
    data: {
      ...data,
      status: WorkflowRunStatus.QUEUED,
    },
  });
}

export async function getWorkflowRunById(userId: string, id: string) {
  const run = await db.workflowRun.findUnique({ where: { id } });

  if (!run) {
    throw new Error("Workflow run not found");
  }

  await assertMembership(userId, run.workspaceId);

  return run;
}

export async function getRunsByWorkflow(userId: string, workflowId: string) {
  const workflow = await db.workflow.findUnique({ where: { id: workflowId } });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  await assertMembership(userId, workflow.workspaceId);

  return db.workflowRun.findMany({
    where: { workflowId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRunsByWorkspace(userId: string, workspaceId: string) {
  await assertMembership(userId, workspaceId);

  return db.workflowRun.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

// ── Worker-only functions (called internally by BullMQ — no user RBAC) ────────

export async function markRunStarted(id: string) {
  return db.workflowRun.update({
    where: { id },
    data: {
      status: WorkflowRunStatus.RUNNING,
      startedAt: new Date(),
    },
  });
}

export async function markRunFinished(
  id: string,
  result:
    | { status: "SUCCESS"; output: Prisma.InputJsonValue }
    | { status: "FAILED"; error: string }
) {
  return db.workflowRun.update({
    where: { id },
    data: {
      ...result,
      finishedAt: new Date(),
    },
  });
}
