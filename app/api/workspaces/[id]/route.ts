import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceById, deleteWorkspace } from "@/services/workspace.service";

function getMockUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// GET /api/workspaces/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getMockUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const workspace = await getWorkspaceById(userId, id);
    return NextResponse.json(workspace);
  } catch (error: any) {
    if (error.message === "Not authorized to access this workspace") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/workspaces/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getMockUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteWorkspace(userId, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Not authorized to access this workspace") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message === "Only the workspace owner can delete a workspace") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
