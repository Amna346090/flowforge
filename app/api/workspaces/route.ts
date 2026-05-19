import { NextRequest, NextResponse } from "next/server";
import {
  createWorkspace,
  listUserWorkspaces,
} from "@/services/workspace.service";

// TODO: replace with real session once auth is set up
function getMockUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

// POST /api/workspaces
export async function POST(req: NextRequest) {
  try {
    const userId = getMockUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const workspace = await createWorkspace(userId, name);
    return NextResponse.json(workspace, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/workspaces
export async function GET(req: NextRequest) {
  try {
    const userId = getMockUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaces = await listUserWorkspaces(userId);
    return NextResponse.json(workspaces);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
