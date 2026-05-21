import { describe, it, expect } from "vitest";
import { parseBody } from "@/lib/validations/parse";
import { registerSchema } from "@/lib/validations/auth";
import { createWorkspaceSchema } from "@/lib/validations/workspace";
import {
  createWorkflowSchema,
  updateWorkflowSchema,
} from "@/lib/validations/workflow";
import { createWorkflowRunSchema } from "@/lib/validations/workflowRun";
import {
  addMemberSchema,
  updateMemberRoleSchema,
} from "@/lib/validations/membership";
import { MembershipRole } from "@/generated/prisma/client";

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = parseBody(registerSchema, {
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "password1",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ada@example.com");
    }
  });

  it("rejects missing name", () => {
    const result = parseBody(registerSchema, {
      email: "ada@example.com",
      password: "password1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.name).toBeDefined();
    }
  });

  it("rejects invalid email", () => {
    const result = parseBody(registerSchema, {
      name: "Ada",
      email: "not-an-email",
      password: "password1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.email).toContain("invalid email");
    }
  });

  it("rejects short password", () => {
    const result = parseBody(registerSchema, {
      name: "Ada",
      email: "ada@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.password).toContain(
        "password must be at least 8 characters"
      );
    }
  });
});

describe("createWorkspaceSchema", () => {
  it("accepts valid name", () => {
    const result = parseBody(createWorkspaceSchema, { name: "My Workspace" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My Workspace");
    }
  });

  it("rejects empty name", () => {
    const result = parseBody(createWorkspaceSchema, { name: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.name).toContain("name is required");
    }
  });

  it("rejects missing name", () => {
    const result = parseBody(createWorkspaceSchema, {});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.name).toBeDefined();
    }
  });
});

describe("createWorkflowSchema", () => {
  it("accepts name only", () => {
    const result = parseBody(createWorkflowSchema, { name: "Deploy pipeline" });

    expect(result.success).toBe(true);
  });

  it("accepts name and definition", () => {
    const result = parseBody(createWorkflowSchema, {
      name: "Deploy pipeline",
      definition: { steps: [] },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.definition).toEqual({ steps: [] });
    }
  });

  it("rejects missing name", () => {
    const result = parseBody(createWorkflowSchema, { definition: {} });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.name).toBeDefined();
    }
  });
});

describe("updateWorkflowSchema", () => {
  it("accepts name update", () => {
    const result = parseBody(updateWorkflowSchema, { name: "Renamed" });

    expect(result.success).toBe(true);
  });

  it("accepts definition update", () => {
    const result = parseBody(updateWorkflowSchema, {
      definition: { steps: ["a"] },
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty body", () => {
    const result = parseBody(updateWorkflowSchema, {});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error._errors).toContain("at least one field is required");
    }
  });
});

describe("createWorkflowRunSchema", () => {
  it("accepts empty object input", () => {
    const result = parseBody(createWorkflowRunSchema, { input: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.input).toEqual({});
    }
  });

  it("accepts structured input", () => {
    const result = parseBody(createWorkflowRunSchema, {
      input: { env: "production", retries: 3 },
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing input", () => {
    const result = parseBody(createWorkflowRunSchema, {});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.input).toBeDefined();
    }
  });
});

describe("addMemberSchema", () => {
  it("accepts valid input", () => {
    const result = parseBody(addMemberSchema, {
      userId: "user_2",
      role: MembershipRole.MEMBER,
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing userId", () => {
    const result = parseBody(addMemberSchema, { role: MembershipRole.MEMBER });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.userId).toBeDefined();
    }
  });

  it("rejects invalid role", () => {
    const result = parseBody(addMemberSchema, {
      userId: "user_2",
      role: "SUPERADMIN",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.role).toBeDefined();
    }
  });
});

describe("updateMemberRoleSchema", () => {
  it("accepts valid role", () => {
    const result = parseBody(updateMemberRoleSchema, {
      role: MembershipRole.ADMIN,
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing role", () => {
    const result = parseBody(updateMemberRoleSchema, {});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.role).toBeDefined();
    }
  });

  it("rejects invalid role", () => {
    const result = parseBody(updateMemberRoleSchema, { role: "INVALID" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.role).toBeDefined();
    }
  });
});
