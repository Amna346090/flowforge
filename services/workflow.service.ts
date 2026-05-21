import { MembershipRole, Prisma } from "@/generated/prisma/client";
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

export async function createWorkflow(
  userId: string,
  workspaceId: string,
  data: { name: string; definition?: Prisma.InputJsonValue }
) {
  await assertMembership(userId, workspaceId);

  return db.workflow.create({
    data: {
      name: data.name,
      definition: data.definition ?? {},
      workspaceId,
      createdById: userId,
    },
  });
}

export async function getWorkflowById(userId: string, id: string) {
  const workflow = await db.workflow.findUnique({ where: { id } });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  await assertMembership(userId, workflow.workspaceId);

  return workflow;
}

export async function getWorkflowsByWorkspace(
  userId: string,
  workspaceId: string
) {
  await assertMembership(userId, workspaceId);

  return db.workflow.findMany({ where: { workspaceId } });
}

export async function getWorkflowForExecution(workflowId: string) {
  const workflow = await db.workflow.findUnique({ where: { id: workflowId } });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return workflow;
}

export async function updateWorkflow(
  userId: string,
  id: string,
  data: Partial<{ name: string; definition: Prisma.InputJsonValue }>
) {
  const workflow = await db.workflow.findUnique({ where: { id } });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  const membership = await assertMembership(userId, workflow.workspaceId);
  const isOwnerOrAdmin =
    membership.role === MembershipRole.OWNER ||
    membership.role === MembershipRole.ADMIN;
  const isCreator = workflow.createdById === userId;

  if (!isOwnerOrAdmin && !isCreator) {
    throw new Error("Only owners, admins, or the workflow creator can update this workflow");
  }

  return db.workflow.update({ where: { id }, data });
}

export async function deleteWorkflow(userId: string, id: string) {
  const workflow = await db.workflow.findUnique({ where: { id } });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  const membership = await assertMembership(userId, workflow.workspaceId);
  const isOwnerOrAdmin =
    membership.role === MembershipRole.OWNER ||
    membership.role === MembershipRole.ADMIN;
  const isCreator = workflow.createdById === userId;

  if (!isOwnerOrAdmin && !isCreator) {
    throw new Error("Only owners, admins, or the workflow creator can delete this workflow");
  }

  return db.workflow.delete({ where: { id } });
}
