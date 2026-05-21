import { NextRequest, NextResponse } from "next/server";
import { createWorkspace, listUserWorkspaces } from "@/services/workspace.service";
import { getSession } from "@/lib/session";
import { createWorkspaceSchema } from "@/lib/validations/workspace";
import { parseBody } from "@/lib/validations/parse";

// POST /api/workspaces
export async function POST(req: NextRequest) {
  try {
    const user = await getSession();

    const body = await req.json();
    const parsed = parseBody(createWorkspaceSchema, body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const workspace = await createWorkspace(user.id, parsed.data.name);
    return NextResponse.json(workspace, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/workspaces
export async function GET() {
  try {
    const user = await getSession();
    const workspaces = await listUserWorkspaces(user.id);
    return NextResponse.json(workspaces);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
