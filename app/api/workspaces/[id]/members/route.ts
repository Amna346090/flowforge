import { NextRequest, NextResponse } from "next/server";
import { addMember, getMembersByWorkspace } from "@/services/membership.service";
import { MembershipRole } from "@/generated/prisma/client";

function getMockUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// GET /api/workspaces/[id]/members
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getMockUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workspaceId } = await params;
    const members = await getMembersByWorkspace(userId, workspaceId);
    return NextResponse.json(members);
  } catch (error: any) {
    if (error.message === "Not authorized to access this workspace") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/workspaces/[id]/members
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getMockUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workspaceId } = await params;
    const body = await req.json();
    const { userId: targetUserId, role } = body;

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const validRoles = Object.values(MembershipRole);
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: `role must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    const member = await addMember(userId, {
      userId: targetUserId,
      workspaceId,
      role,
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    if (error.message === "Not authorized to access this workspace") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message === "Only owners and admins can perform this action") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
