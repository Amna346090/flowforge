import { NextRequest, NextResponse } from "next/server";
import {
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
} from "@/services/workflow.service";

function getMockUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// GET /api/workflows/[id]
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
    const workflow = await getWorkflowById(userId, id);
    return NextResponse.json(workflow);
  } catch (error: any) {
    if (error.message === "Workflow not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message === "Not authorized to access this workspace") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/workflows/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getMockUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, definition } = body;

    const workflow = await updateWorkflow(userId, id, { name, definition });
    return NextResponse.json(workflow);
  } catch (error: any) {
    if (error.message === "Workflow not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (
      error.message === "Not authorized to access this workspace" ||
      error.message.startsWith("Only owners")
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/workflows/[id]
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
    await deleteWorkflow(userId, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Workflow not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (
      error.message === "Not authorized to access this workspace" ||
      error.message.startsWith("Only owners")
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
