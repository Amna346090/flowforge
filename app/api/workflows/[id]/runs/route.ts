import { NextRequest, NextResponse } from "next/server";
import { createWorkflowRun, getRunsByWorkflow } from "@/services/workflowRun.service";
import { getSession } from "@/lib/session";

// POST /api/workflows/[id]/runs
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    const { id: workflowId } = await params;
    const body = await req.json();
    const { input } = body;

    if (input === undefined) {
      return NextResponse.json({ error: "input is required" }, { status: 400 });
    }

    const run = await createWorkflowRun(user.id, workflowId, input);
    return NextResponse.json(run, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error.message === "Workflow not found" ||
      error.message === "Not authorized to access this workspace"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/workflows/[id]/runs
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    const { id: workflowId } = await params;
    const runs = await getRunsByWorkflow(user.id, workflowId);
    return NextResponse.json(runs);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error.message === "Workflow not found" ||
      error.message === "Not authorized to access this workspace"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
