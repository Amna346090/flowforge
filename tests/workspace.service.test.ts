import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  createWorkspace,
  getWorkspaceById,
  listUserWorkspaces,
  deleteWorkspace,
} from "@/services/workspace.service";
import { MembershipRole } from "@/generated/prisma/client";

vi.mock("@/lib/db");

const mockWorkspace = {
  id: "ws_1",
  name: "Test Workspace",
  ownerId: "user_1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOwnerMembership = {
  id: "mem_1",
  userId: "user_1",
  workspaceId: "ws_1",
  role: MembershipRole.OWNER,
  createdAt: new Date(),
};

const mockMemberMembership = {
  ...mockOwnerMembership,
  userId: "user_2",
  role: MembershipRole.MEMBER,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── createWorkspace ───────────────────────────────────────────────────────────

describe("createWorkspace", () => {
  it("creates a workspace and adds the creator as OWNER", async () => {
    vi.mocked(db.workspace.create).mockResolvedValue(mockWorkspace);
    vi.mocked(db.membership.create).mockResolvedValue(mockOwnerMembership);

    const result = await createWorkspace("user_1", "Test Workspace");

    expect(db.workspace.create).toHaveBeenCalledWith({
      data: { name: "Test Workspace", ownerId: "user_1" },
    });
    expect(db.membership.create).toHaveBeenCalledWith({
      data: { userId: "user_1", workspaceId: "ws_1", role: MembershipRole.OWNER },
    });
    expect(result).toEqual(mockWorkspace);
  });

  it("runs inside a transaction", async () => {
    vi.mocked(db.workspace.create).mockResolvedValue(mockWorkspace);
    vi.mocked(db.membership.create).mockResolvedValue(mockOwnerMembership);

    await createWorkspace("user_1", "Test Workspace");

    expect(db.$transaction).toHaveBeenCalledOnce();
  });
});

// ── getWorkspaceById ──────────────────────────────────────────────────────────

describe("getWorkspaceById", () => {
  it("returns workspace when user is a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(mockOwnerMembership);
    vi.mocked(db.workspace.findUnique).mockResolvedValue(mockWorkspace);

    const result = await getWorkspaceById("user_1", "ws_1");

    expect(result).toEqual(mockWorkspace);
  });

  it("throws when user has no membership", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(null);

    await expect(getWorkspaceById("user_2", "ws_1")).rejects.toThrow(
      "Not authorized to access this workspace"
    );

    expect(db.workspace.findUnique).not.toHaveBeenCalled();
  });
});

// ── listUserWorkspaces ────────────────────────────────────────────────────────

describe("listUserWorkspaces", () => {
  it("returns all workspaces the user is a member of", async () => {
    vi.mocked(db.workspace.findMany).mockResolvedValue([mockWorkspace]);

    const result = await listUserWorkspaces("user_1");

    expect(db.workspace.findMany).toHaveBeenCalledWith({
      where: { memberships: { some: { userId: "user_1" } } },
    });
    expect(result).toEqual([mockWorkspace]);
  });

  it("returns empty array when user has no workspaces", async () => {
    vi.mocked(db.workspace.findMany).mockResolvedValue([]);

    const result = await listUserWorkspaces("user_2");

    expect(result).toEqual([]);
  });
});

// ── deleteWorkspace ───────────────────────────────────────────────────────────

describe("deleteWorkspace", () => {
  it("deletes workspace when user is OWNER", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(mockOwnerMembership);
    vi.mocked(db.workspace.delete).mockResolvedValue(mockWorkspace);

    await deleteWorkspace("user_1", "ws_1");

    expect(db.workspace.delete).toHaveBeenCalledWith({ where: { id: "ws_1" } });
  });

  it("throws when user is not a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(null);

    await expect(deleteWorkspace("user_2", "ws_1")).rejects.toThrow(
      "Not authorized to access this workspace"
    );
    expect(db.workspace.delete).not.toHaveBeenCalled();
  });

  it("throws when user is a MEMBER (not OWNER)", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(mockMemberMembership);

    await expect(deleteWorkspace("user_2", "ws_1")).rejects.toThrow(
      "Only the workspace owner can delete a workspace"
    );
    expect(db.workspace.delete).not.toHaveBeenCalled();
  });
});
