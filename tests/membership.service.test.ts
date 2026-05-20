import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  getMembership,
  getMembersByWorkspace,
  addMember,
  updateMemberRole,
  removeMember,
} from "@/services/membership.service";
import { MembershipRole } from "@/generated/prisma/client";

vi.mock("@/lib/db");

const ownerMembership = {
  id: "mem_1",
  userId: "user_1",
  workspaceId: "ws_1",
  role: MembershipRole.OWNER,
  createdAt: new Date(),
};

const adminMembership = {
  ...ownerMembership,
  id: "mem_2",
  userId: "user_2",
  role: MembershipRole.ADMIN,
};

const memberMembership = {
  ...ownerMembership,
  id: "mem_3",
  userId: "user_3",
  role: MembershipRole.MEMBER,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── getMembership ─────────────────────────────────────────────────────────────

describe("getMembership", () => {
  it("returns membership when requester is a member", async () => {
    vi.mocked(db.membership.findUnique)
      .mockResolvedValueOnce(ownerMembership) // requester check
      .mockResolvedValueOnce(memberMembership); // target lookup

    const result = await getMembership("user_1", "user_3", "ws_1");
    expect(result).toEqual(memberMembership);
  });

  it("throws when requester is not a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValueOnce(null);

    await expect(getMembership("outsider", "user_3", "ws_1")).rejects.toThrow(
      "Not authorized to access this workspace"
    );
  });
});

// ── getMembersByWorkspace ─────────────────────────────────────────────────────

describe("getMembersByWorkspace", () => {
  it("returns all members when requester is a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(ownerMembership);
    vi.mocked(db.membership.findMany).mockResolvedValue([ownerMembership, memberMembership] as any);

    const result = await getMembersByWorkspace("user_1", "ws_1");
    expect(result).toHaveLength(2);
  });

  it("throws when requester is not a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(null);

    await expect(getMembersByWorkspace("outsider", "ws_1")).rejects.toThrow(
      "Not authorized to access this workspace"
    );
  });
});

// ── addMember ─────────────────────────────────────────────────────────────────

describe("addMember", () => {
  it("adds member when requester is OWNER", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(ownerMembership);
    vi.mocked(db.membership.create).mockResolvedValue(memberMembership);

    await addMember("user_1", { userId: "user_3", workspaceId: "ws_1", role: MembershipRole.MEMBER });

    expect(db.membership.create).toHaveBeenCalledOnce();
  });

  it("adds member when requester is ADMIN", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(adminMembership);
    vi.mocked(db.membership.create).mockResolvedValue(memberMembership);

    await addMember("user_2", { userId: "user_3", workspaceId: "ws_1", role: MembershipRole.MEMBER });

    expect(db.membership.create).toHaveBeenCalledOnce();
  });

  it("throws when requester is MEMBER", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(memberMembership);

    await expect(
      addMember("user_3", { userId: "user_4", workspaceId: "ws_1", role: MembershipRole.MEMBER })
    ).rejects.toThrow("Only owners and admins can perform this action");

    expect(db.membership.create).not.toHaveBeenCalled();
  });
});

// ── updateMemberRole ──────────────────────────────────────────────────────────

describe("updateMemberRole", () => {
  it("updates role when requester is OWNER", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(ownerMembership);
    vi.mocked(db.membership.count).mockResolvedValue(1); // other owner exists
    vi.mocked(db.membership.update).mockResolvedValue({ ...memberMembership, role: MembershipRole.ADMIN });

    await updateMemberRole("user_1", "user_3", "ws_1", MembershipRole.ADMIN);

    expect(db.membership.update).toHaveBeenCalledOnce();
  });

  it("throws when requester is ADMIN (not OWNER)", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(adminMembership);

    await expect(
      updateMemberRole("user_2", "user_3", "ws_1", MembershipRole.MEMBER)
    ).rejects.toThrow("Only the workspace owner can perform this action");
  });

  it("throws when demoting last owner", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(ownerMembership);
    vi.mocked(db.membership.count).mockResolvedValue(0); // no other owner

    await expect(
      updateMemberRole("user_1", "user_1", "ws_1", MembershipRole.MEMBER)
    ).rejects.toThrow("Workspace must have at least one owner");
  });
});

// ── removeMember ──────────────────────────────────────────────────────────────

describe("removeMember", () => {
  it("allows OWNER to remove a member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(ownerMembership);
    vi.mocked(db.membership.count).mockResolvedValue(1);
    vi.mocked(db.membership.delete).mockResolvedValue(memberMembership);

    await removeMember("user_1", "user_3", "ws_1");

    expect(db.membership.delete).toHaveBeenCalledOnce();
  });

  it("allows member to remove themselves", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(memberMembership);
    vi.mocked(db.membership.count).mockResolvedValue(1);
    vi.mocked(db.membership.delete).mockResolvedValue(memberMembership);

    await removeMember("user_3", "user_3", "ws_1");

    expect(db.membership.delete).toHaveBeenCalledOnce();
  });

  it("throws when MEMBER tries to remove another member", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(memberMembership);

    await expect(removeMember("user_3", "user_2", "ws_1")).rejects.toThrow(
      "Only owners and admins can remove other members"
    );
  });

  it("throws when removing the last owner", async () => {
    vi.mocked(db.membership.findUnique).mockResolvedValue(ownerMembership);
    vi.mocked(db.membership.count).mockResolvedValue(0);

    await expect(removeMember("user_1", "user_1", "ws_1")).rejects.toThrow(
      "Workspace must have at least one owner"
    );
  });
});
