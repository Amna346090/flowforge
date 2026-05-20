import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  createWorkflow,
  getWorkflowById,
  getWorkflowsByWorkspace,
  updateWorkflow,
  deleteWorkflow,
} from "@/services/workflow.service";
import { MembershipRole } from "@/generated/prisma/client";

vi.mock("@/lib/db");

const mockWorkflow = {
  id: "wf_1",
  name: "Test Workflow",
  definition: {},
  workspaceId: "ws_1",
  createdById: "user_1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const ownerMembership = {
  id: "mem_1",
  userId: "user_1",
  workspaceId: "ws_1",
  role: MembershipRole.OWNER,
  createdAt: new Date(),
};

const memberMembership = {
  ...ownerMembership,
  id: "mem_2",
  userId: "user_2",
  role: MembershipRole.MEMBER,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── createWorkflow ────────────────────────────────────────────────────────────

describe("createWorkflow", () => {
  it("creates workflow when user is a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(ownerMembership);
    vi.mocked(db.workflow.create).mockResolvedValue(mockWorkflow);

    const result = await createWorkflow("user_1", "ws_1", { name: "Test Workflow" });

    expect(db.workflow.create).toHaveBeenCalledWith({
      data: { name: "Test Workflow", definition: {}, workspaceId: "ws_1", createdById: "user_1" },
    });
    expect(result).toEqual(mockWorkflow);
  });

  it("throws when user is not a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(null);

    await expect(
      createWorkflow("outsider", "ws_1", { name: "Test" })
    ).rejects.toThrow("Not authorized to access this workspace");

    expect(db.workflow.create).not.toHaveBeenCalled();
  });
});

// ── getWorkflowById ───────────────────────────────────────────────────────────

describe("getWorkflowById", () => {
  it("returns workflow when user is a member", async () => {
    vi.mocked(db.workflow.findUnique).mockResolvedValue(mockWorkflow);
    vi.mocked(db.membership.findUnique).mockResolvedValue(ownerMembership);

    const result = await getWorkflowById("user_1", "wf_1");
    expect(result).toEqual(mockWorkflow);
  });

  it("throws when workflow not found", async () => {
    vi.mocked(db.workflow.findUnique).mockResolvedValue(null);

    await expect(getWorkflowById("user_1", "wf_999")).rejects.toThrow("Workflow not found");
  });

  it("throws when user is not a member", async () => {
    vi.mocked(db.workflow.findUnique).mockResolvedValue(mockWorkflow);
    vi.mocked(db.membership.findUnique).mockResolvedValue(null);

    await expect(getWorkflowById("outsider", "wf_1")).rejects.toThrow(
      "Not authorized to access this workspace"
    );
  });
});

// ── getWorkflowsByWorkspace ───────────────────────────────────────────────────

describe("getWorkflowsByWorkspace", () => {
  it("returns workflows when user is a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(ownerMembership);
    vi.mocked(db.workflow.findMany).mockResolvedValue([mockWorkflow]);

    const result = await getWorkflowsByWorkspace("user_1", "ws_1");
    expect(result).toEqual([mockWorkflow]);
  });

  it("throws when user is not a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(null);

    await expect(getWorkflowsByWorkspace("outsider", "ws_1")).rejects.toThrow(
      "Not authorized to access this workspace"
    );
  });
});

// ── updateWorkflow ────────────────────────────────────────────────────────────

describe("updateWorkflow", () => {
  it("updates workflow when user is OWNER", async () => {
    vi.mocked(db.workflow.findUnique).mockResolvedValue(mockWorkflow);
    vi.mocked(db.membership.findUnique).mockResolvedValue(ownerMembership);
    vi.mocked(db.workflow.update).mockResolvedValue({ ...mockWorkflow, name: "Updated" });

    await updateWorkflow("user_1", "wf_1", { name: "Updated" });
    expect(db.workflow.update).toHaveBeenCalledOnce();
  });

  it("updates workflow when user is the creator", async () => {
    vi.mocked(db.workflow.findUnique).mockResolvedValue(mockWorkflow); // createdById: "user_1"
    vi.mocked(db.membership.findUnique).mockResolvedValue(memberMembership);
    vi.mocked(db.workflow.update).mockResolvedValue(mockWorkflow);

    // user_1 is the creator even though they have MEMBER role via memberMembership is user_2
    // Fix: use ownerMembership for user_1 as MEMBER
    const creatorAsMember = { ...memberMembership, userId: "user_1" };
    vi.mocked(db.membership.findUnique).mockResolvedValue(creatorAsMember);

    await updateWorkflow("user_1", "wf_1", { name: "Updated" });
    expect(db.workflow.update).toHaveBeenCalledOnce();
  });

  it("throws when user is MEMBER and not the creator", async () => {
    const otherMembership = { ...memberMembership, userId: "user_2" };
    const workflowByUser1 = { ...mockWorkflow, createdById: "user_1" };

    vi.mocked(db.workflow.findUnique).mockResolvedValue(workflowByUser1);
    vi.mocked(db.membership.findUnique).mockResolvedValue(otherMembership);

    await expect(updateWorkflow("user_2", "wf_1", { name: "Hack" })).rejects.toThrow(
      "Only owners, admins, or the workflow creator can update this workflow"
    );
  });

  it("throws when workflow not found", async () => {
    vi.mocked(db.workflow.findUnique).mockResolvedValue(null);

    await expect(updateWorkflow("user_1", "wf_999", { name: "x" })).rejects.toThrow(
      "Workflow not found"
    );
  });
});

// ── deleteWorkflow ────────────────────────────────────────────────────────────

describe("deleteWorkflow", () => {
  it("deletes workflow when user is OWNER", async () => {
    vi.mocked(db.workflow.findUnique).mockResolvedValue(mockWorkflow);
    vi.mocked(db.membership.findUnique).mockResolvedValue(ownerMembership);
    vi.mocked(db.workflow.delete).mockResolvedValue(mockWorkflow);

    await deleteWorkflow("user_1", "wf_1");
    expect(db.workflow.delete).toHaveBeenCalledOnce();
  });

  it("throws when user is MEMBER and not the creator", async () => {
    const workflowByUser1 = { ...mockWorkflow, createdById: "user_1" };
    const user2Member = { ...memberMembership, userId: "user_2" };

    vi.mocked(db.workflow.findUnique).mockResolvedValue(workflowByUser1);
    vi.mocked(db.membership.findUnique).mockResolvedValue(user2Member);

    await expect(deleteWorkflow("user_2", "wf_1")).rejects.toThrow(
      "Only owners, admins, or the workflow creator can delete this workflow"
    );
  });

  it("throws when workflow not found", async () => {
    vi.mocked(db.workflow.findUnique).mockResolvedValue(null);

    await expect(deleteWorkflow("user_1", "wf_999")).rejects.toThrow("Workflow not found");
  });
});
