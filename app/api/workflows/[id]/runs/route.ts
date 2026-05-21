import { NextRequest, NextResponse } from "next/server";
import { createWorkflowRun, getRunsByWorkflow } from "@/services/workflowRun.service";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workflowQueue } from "@/lib/queue";
import type { WorkflowJobData } from "@/lib/queue";

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

    const workflow = await db.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const run = await createWorkflowRun(user.id, {
      workflowId,
      workspaceId: workflow.workspaceId,
      input,
    });

    const jobData: WorkflowJobData = {
      runId: run.id,
      workflowId,
      workspaceId: workflow.workspaceId,
      input,
    };
    await workflowQueue.add("run", jobData, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    });

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
