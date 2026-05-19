import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
} from "@/services/user.service";

vi.mock("@/lib/db");

const mockUser = {
  id: "user_1",
  name: "Alice",
  email: "alice@flowforge.dev",
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── getUserById ───────────────────────────────────────────────────────────────

describe("getUserById", () => {
  it("returns user when found", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser);

    const result = await getUserById("user_1");

    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { id: "user_1" } });
    expect(result).toEqual(mockUser);
  });

  it("returns null when user not found", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const result = await getUserById("user_999");
    expect(result).toBeNull();
  });
});

// ── getUserByEmail ────────────────────────────────────────────────────────────

describe("getUserByEmail", () => {
  it("returns user when found", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser);

    const result = await getUserByEmail("alice@flowforge.dev");

    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { email: "alice@flowforge.dev" } });
    expect(result).toEqual(mockUser);
  });

  it("returns null when user not found", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const result = await getUserByEmail("nobody@flowforge.dev");
    expect(result).toBeNull();
  });
});

// ── createUser ────────────────────────────────────────────────────────────────

describe("createUser", () => {
  it("creates and returns a new user", async () => {
    vi.mocked(db.user.create).mockResolvedValue(mockUser);

    const result = await createUser({ name: "Alice", email: "alice@flowforge.dev" });

    expect(db.user.create).toHaveBeenCalledWith({
      data: { name: "Alice", email: "alice@flowforge.dev" },
    });
    expect(result).toEqual(mockUser);
  });
});

// ── updateUser ────────────────────────────────────────────────────────────────

describe("updateUser", () => {
  it("updates and returns the user", async () => {
    const updated = { ...mockUser, name: "Alice Updated" };
    vi.mocked(db.user.update).mockResolvedValue(updated);

    const result = await updateUser("user_1", { name: "Alice Updated" });

    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { name: "Alice Updated" },
    });
    expect(result.name).toBe("Alice Updated");
  });
});
