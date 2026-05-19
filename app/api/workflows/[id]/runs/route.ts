import { NextRequest, NextResponse } from "next/server";
import {
  createWorkflowRun,
  getRunsByWorkflow,
} from "@/services/workflowRun.service";
import { getWorkflowById } from "@/services/workflow.service";

function getMockUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// POST /api/workflows/[id]/runs
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getMockUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workflowId } = await params;
    const body = await req.json();
    const { input } = body;

    if (input === undefined) {
      return NextResponse.json({ error: "input is required" }, { status: 400 });
    }

    // Resolve workspaceId from the workflow
    const workflow = await getWorkflowById(userId, workflowId);
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const run = await createWorkflowRun(userId, {
      workflowId,
      workspaceId: workflow.workspaceId,
      input,
    });

    return NextResponse.json(run, { status: 201 });
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

// GET /api/workflows/[id]/runs
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getMockUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workflowId } = await params;
    const runs = await getRunsByWorkflow(userId, workflowId);
    return NextResponse.json(runs);
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
