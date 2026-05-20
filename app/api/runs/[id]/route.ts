import { NextRequest, NextResponse } from "next/server";
import { getWorkflowRunById } from "@/services/workflowRun.service";
import { getSession } from "@/lib/session";

// GET /api/runs/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    const { id } = await params;
    const run = await getWorkflowRunById(user.id, id);
    return NextResponse.json(run);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error.message === "Run not found" ||
      error.message === "Not authorized to access this workspace"
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
