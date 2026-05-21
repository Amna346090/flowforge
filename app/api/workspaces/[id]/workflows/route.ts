import { NextRequest, NextResponse } from "next/server";
import { createWorkflow, getWorkflowsByWorkspace } from "@/services/workflow.service";
import { getSession } from "@/lib/session";
import { createWorkflowSchema } from "@/lib/validations/workflow";
import { parseBody } from "@/lib/validations/parse";

// POST /api/workspaces/[id]/workflows
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    const { id: workspaceId } = await params;
    const body = await req.json();
    const parsed = parseBody(createWorkflowSchema, body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const workflow = await createWorkflow(user.id, workspaceId, parsed.data);
    return NextResponse.json(workflow, { status: 201 });
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

// GET /api/workspaces/[id]/workflows
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    const { id: workspaceId } = await params;
    const workflows = await getWorkflowsByWorkspace(user.id, workspaceId);
    return NextResponse.json(workflows);
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
