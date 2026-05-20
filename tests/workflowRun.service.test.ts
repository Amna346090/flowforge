import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  createWorkflowRun,
  getWorkflowRunById,
  getRunsByWorkflow,
  getRunsByWorkspace,
  markRunStarted,
  markRunFinished,
} from "@/services/workflowRun.service";
import { MembershipRole, WorkflowRunStatus } from "@/generated/prisma/client";

vi.mock("@/lib/db");

const mockMembership = {
  id: "mem_1",
  userId: "user_1",
  workspaceId: "ws_1",
  role: MembershipRole.MEMBER,
  createdAt: new Date(),
};

const mockWorkflow = {
  id: "wf_1",
  name: "Test Workflow",
  definition: {},
  workspaceId: "ws_1",
  createdById: "user_1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRun = {
  id: "run_1",
  workflowId: "wf_1",
  workspaceId: "ws_1",
  status: WorkflowRunStatus.QUEUED,
  input: { text: "hello" },
  output: null,
  error: null,
  startedAt: null,
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── createWorkflowRun ─────────────────────────────────────────────────────────

describe("createWorkflowRun", () => {
  it("creates run with QUEUED status when user is a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(mockMembership);
    vi.mocked(db.workflowRun.create).mockResolvedValue(mockRun);

    const result = await createWorkflowRun("user_1", {
      workflowId: "wf_1",
      workspaceId: "ws_1",
      input: { text: "hello" },
    });

    expect(db.workflowRun.create).toHaveBeenCalledWith({
      data: { workflowId: "wf_1", workspaceId: "ws_1", input: { text: "hello" }, status: WorkflowRunStatus.QUEUED },
    });
    expect(result.status).toBe(WorkflowRunStatus.QUEUED);
  });

  it("throws when user is not a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(null);

    await expect(
      createWorkflowRun("outsider", { workflowId: "wf_1", workspaceId: "ws_1", input: {} })
    ).rejects.toThrow("Not authorized to access this workspace");
  });
});

// ── getWorkflowRunById ────────────────────────────────────────────────────────

describe("getWorkflowRunById", () => {
  it("returns run when user is a member", async () => {
    vi.mocked(db.workflowRun.findUnique).mockResolvedValue(mockRun);
    vi.mocked(db.membership.findUnique).mockResolvedValue(mockMembership);

    const result = await getWorkflowRunById("user_1", "run_1");
    expect(result).toEqual(mockRun);
  });

  it("throws when run not found", async () => {
    vi.mocked(db.workflowRun.findUnique).mockResolvedValue(null);

    await expect(getWorkflowRunById("user_1", "run_999")).rejects.toThrow(
      "Workflow run not found"
    );
  });

  it("throws when user is not a member", async () => {
    vi.mocked(db.workflowRun.findUnique).mockResolvedValue(mockRun);
    vi.mocked(db.membership.findUnique).mockResolvedValue(null);

    await expect(getWorkflowRunById("outsider", "run_1")).rejects.toThrow(
      "Not authorized to access this workspace"
    );
  });
});

// ── getRunsByWorkflow ─────────────────────────────────────────────────────────

describe("getRunsByWorkflow", () => {
  it("returns runs when user is a member", async () => {
    vi.mocked(db.workflow.findUnique).mockResolvedValue(mockWorkflow);
    vi.mocked(db.membership.findUnique).mockResolvedValue(mockMembership);
    vi.mocked(db.workflowRun.findMany).mockResolvedValue([mockRun]);

    const result = await getRunsByWorkflow("user_1", "wf_1");
    expect(result).toEqual([mockRun]);
  });

  it("throws when workflow not found", async () => {
    vi.mocked(db.workflow.findUnique).mockResolvedValue(null);

    await expect(getRunsByWorkflow("user_1", "wf_999")).rejects.toThrow("Workflow not found");
  });
});

// ── getRunsByWorkspace ────────────────────────────────────────────────────────

describe("getRunsByWorkspace", () => {
  it("returns runs when user is a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(mockMembership);
    vi.mocked(db.workflowRun.findMany).mockResolvedValue([mockRun]);

    const result = await getRunsByWorkspace("user_1", "ws_1");
    expect(result).toEqual([mockRun]);
  });

  it("throws when user is not a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(null);

    await expect(getRunsByWorkspace("outsider", "ws_1")).rejects.toThrow(
      "Not authorized to access this workspace"
    );
  });
});

// ── markRunStarted ────────────────────────────────────────────────────────────

describe("markRunStarted", () => {
  it("sets status to RUNNING and sets startedAt", async () => {
    const updatedRun = { ...mockRun, status: WorkflowRunStatus.RUNNING, startedAt: new Date() };
    vi.mocked(db.workflowRun.update).mockResolvedValue(updatedRun);

    const result = await markRunStarted("run_1");

    expect(db.workflowRun.update).toHaveBeenCalledWith({
      where: { id: "run_1" },
      data: { status: WorkflowRunStatus.RUNNING, startedAt: expect.any(Date) },
    });
    expect(result.status).toBe(WorkflowRunStatus.RUNNING);
  });
});

// ── markRunFinished ───────────────────────────────────────────────────────────

describe("markRunFinished", () => {
  it("sets status to SUCCESS with output", async () => {
    const updatedRun = { ...mockRun, status: WorkflowRunStatus.SUCCESS, output: { result: "done" }, finishedAt: new Date() };
    vi.mocked(db.workflowRun.update).mockResolvedValue(updatedRun);

    await markRunFinished("run_1", { status: "SUCCESS", output: { result: "done" } });

    expect(db.workflowRun.update).toHaveBeenCalledWith({
      where: { id: "run_1" },
      data: { status: "SUCCESS", output: { result: "done" }, finishedAt: expect.any(Date) },
    });
  });

  it("sets status to FAILED with error", async () => {
    const updatedRun = { ...mockRun, status: WorkflowRunStatus.FAILED, error: "timeout", finishedAt: new Date() };
    vi.mocked(db.workflowRun.update).mockResolvedValue(updatedRun);

    await markRunFinished("run_1", { status: "FAILED", error: "timeout" });

    expect(db.workflowRun.update).toHaveBeenCalledWith({
      where: { id: "run_1" },
      data: { status: "FAILED", error: "timeout", finishedAt: expect.any(Date) },
    });
  });
});
