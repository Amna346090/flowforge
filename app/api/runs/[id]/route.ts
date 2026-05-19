import { NextRequest, NextResponse } from "next/server";
import { getWorkflowRunById } from "@/services/workflowRun.service";

function getMockUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// GET /api/runs/[id]
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
    const run = await getWorkflowRunById(userId, id);
    return NextResponse.json(run);
  } catch (error: any) {
    if (error.message === "Workflow run not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message === "Not authorized to access this workspace") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
