import { NextRequest, NextResponse } from "next/server";
import { updateMemberRole, removeMember } from "@/services/membership.service";
import { MembershipRole } from "@/generated/prisma/client";
import { getSession } from "@/lib/session";

// PATCH /api/workspaces/[id]/members/[userId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getSession();
    const { id: workspaceId, userId: targetUserId } = await params;
    const body = await req.json();
    const { role } = body;

    const validRoles = Object.values(MembershipRole);
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: `role must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await updateMemberRole(user.id, targetUserId, workspaceId, role);
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error.message === "Not authorized to access this workspace" ||
      error.message === "Only the workspace owner can perform this action"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message === "Workspace must have at least one owner") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/workspaces/[id]/members/[userId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getSession();
    const { id: workspaceId, userId: targetUserId } = await params;
    await removeMember(user.id, targetUserId, workspaceId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error.message === "Not authorized to access this workspace" ||
      error.message === "Only owners and admins can remove other members"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message === "Workspace must have at least one owner") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
