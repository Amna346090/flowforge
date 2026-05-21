import { NextRequest, NextResponse } from "next/server";
import { addMember, getMembersByWorkspace } from "@/services/membership.service";
import { getSession } from "@/lib/session";
import { addMemberSchema } from "@/lib/validations/membership";
import { parseBody } from "@/lib/validations/parse";

// GET /api/workspaces/[id]/members
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    const { id: workspaceId } = await params;
    const members = await getMembersByWorkspace(user.id, workspaceId);
    return NextResponse.json(members);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
    const user = await getSession();
    const { id: workspaceId } = await params;
    const body = await req.json();
    const parsed = parseBody(addMemberSchema, body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { userId: targetUserId, role } = parsed.data;

    const member = await addMember(user.id, { userId: targetUserId, workspaceId, role });
    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error.message === "Not authorized to access this workspace" ||
      error.message === "Only owners and admins can perform this action"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
