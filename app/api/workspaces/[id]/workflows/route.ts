import { NextRequest, NextResponse } from "next/server";
import {
  createWorkflow,
  getWorkflowsByWorkspace,
} from "@/services/workflow.service";

function getMockUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// POST /api/workspaces/[id]/workflows
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
    const { name, definition } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const workflow = await createWorkflow(userId, workspaceId, {
      name,
      definition,
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error: any) {
    if (error.message === "Not authorized to access this workspace") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/workspaces/[id]/workflows
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
    const workflows = await getWorkflowsByWorkspace(userId, workspaceId);
    return NextResponse.json(workflows);
  } catch (error: any) {
    if (error.message === "Not authorized to access this workspace") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
