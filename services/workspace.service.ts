import { MembershipRole } from "@/generated/prisma/client";
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

export async function createWorkspace(userId: string, name: string) {
  return db.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: { name, ownerId: userId },
    });

    await tx.membership.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: MembershipRole.OWNER,
      },
    });

    return workspace;
  });
}

export async function getWorkspaceById(userId: string, workspaceId: string) {
  await assertMembership(userId, workspaceId);
  return db.workspace.findUnique({ where: { id: workspaceId } });
}

export async function listUserWorkspaces(userId: string) {
  return db.workspace.findMany({
    where: {
      memberships: { some: { userId } },
    },
  });
}

export async function deleteWorkspace(userId: string, workspaceId: string) {
  const membership = await assertMembership(userId, workspaceId);

  if (membership.role !== MembershipRole.OWNER) {
    throw new Error("Only the workspace owner can delete a workspace");
  }

  return db.workspace.delete({ where: { id: workspaceId } });
}
