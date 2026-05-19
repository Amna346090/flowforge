import { MembershipRole } from "@/generated/prisma/client";
import { db } from "@/lib/db";

async function getRequesterMembership(requesterId: string, workspaceId: string) {
  const membership = await db.membership.findUnique({
    where: { userId_workspaceId: { userId: requesterId, workspaceId } },
  });

  if (!membership) {
    throw new Error("Not authorized to access this workspace");
  }

  return membership;
}

async function guardOwnerRole(requesterId: string, workspaceId: string) {
  const membership = await getRequesterMembership(requesterId, workspaceId);

  if (membership.role !== MembershipRole.OWNER) {
    throw new Error("Only the workspace owner can perform this action");
  }

  return membership;
}

async function guardOwnerOrAdminRole(requesterId: string, workspaceId: string) {
  const membership = await getRequesterMembership(requesterId, workspaceId);

  if (
    membership.role !== MembershipRole.OWNER &&
    membership.role !== MembershipRole.ADMIN
  ) {
    throw new Error("Only owners and admins can perform this action");
  }

  return membership;
}

async function ensureOwnerExists(workspaceId: string, excludeUserId?: string) {
  const ownerCount = await db.membership.count({
    where: {
      workspaceId,
      role: MembershipRole.OWNER,
      ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
    },
  });

  if (ownerCount === 0) {
    throw new Error("Workspace must have at least one owner");
  }
}

// ── Read ─────────────────────────────────────────────────────────────────────

export async function getMembership(
  requesterId: string,
  userId: string,
  workspaceId: string
) {
  await getRequesterMembership(requesterId, workspaceId);

  return db.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
}

export async function getMembersByWorkspace(
  requesterId: string,
  workspaceId: string
) {
  await getRequesterMembership(requesterId, workspaceId);

  return db.membership.findMany({
    where: { workspaceId },
    include: { user: true },
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function addMember(
  requesterId: string,
  data: { userId: string; workspaceId: string; role: MembershipRole }
) {
  await guardOwnerOrAdminRole(requesterId, data.workspaceId);

  return db.membership.create({ data });
}

export async function updateMemberRole(
  requesterId: string,
  targetUserId: string,
  workspaceId: string,
  role: MembershipRole
) {
  await guardOwnerRole(requesterId, workspaceId);

  if (role !== MembershipRole.OWNER) {
    await ensureOwnerExists(workspaceId, targetUserId);
  }

  return db.membership.update({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    data: { role },
  });
}

export async function removeMember(
  requesterId: string,
  targetUserId: string,
  workspaceId: string
) {
  const requester = await getRequesterMembership(requesterId, workspaceId);
  const isSelfRemoval = requesterId === targetUserId;

  if (
    !isSelfRemoval &&
    requester.role !== MembershipRole.OWNER &&
    requester.role !== MembershipRole.ADMIN
  ) {
    throw new Error("Only owners and admins can remove other members");
  }

  await ensureOwnerExists(workspaceId, targetUserId);

  return db.membership.delete({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
  });
}
