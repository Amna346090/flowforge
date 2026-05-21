import { NextRequest, NextResponse } from "next/server";
import { getWorkflowById, updateWorkflow, deleteWorkflow } from "@/services/workflow.service";
import { getSession } from "@/lib/session";
import { updateWorkflowSchema } from "@/lib/validations/workflow";
import { parseBody } from "@/lib/validations/parse";

// GET /api/workflows/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    const { id } = await params;
    const workflow = await getWorkflowById(user.id, id);
    return NextResponse.json(workflow);
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

// PATCH /api/workflows/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    const { id } = await params;
    const body = await req.json();
    const parsed = parseBody(updateWorkflowSchema, body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const workflow = await updateWorkflow(user.id, id, parsed.data);
    return NextResponse.json(workflow);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error.message === "Workflow not found" ||
      error.message === "Not authorized to access this workspace" ||
      error.message === "Only owners, admins, or the creator can update this workflow"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/workflows/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    const { id } = await params;
    await deleteWorkflow(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error.message === "Workflow not found" ||
      error.message === "Not authorized to access this workspace" ||
      error.message === "Only owners, admins, or the creator can delete this workflow"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
