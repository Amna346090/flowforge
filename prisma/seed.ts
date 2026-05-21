import bcrypt from "bcryptjs";
import { MembershipRole } from "../generated/prisma/client";
import { db } from "../lib/db";

const DEMO_EMAIL = "demo@flowforge.com";
const DEMO_PASSWORD = "demo12345";

const DEMO_WORKFLOWS = [
  {
    name: "Send welcome email",
    definition: {
      prompt:
        "Write a short, friendly welcome email for a new team member. Include their name and role. Keep it under 150 words. Sign off from the People team.",
      inputFields: [
        {
          key: "name",
          label: "Name",
          type: "text",
          required: true,
          placeholder: "Jane Smith",
        },
        {
          key: "email",
          label: "Email",
          type: "email",
          required: true,
          placeholder: "jane@example.com",
        },
        {
          key: "role",
          label: "Role",
          type: "text",
          required: false,
          placeholder: "Product Designer",
        },
      ],
    },
  },
  {
    name: "LinkedIn intro",
    definition: {
      prompt:
        "Write a professional LinkedIn connection note for someone joining our company. Mention their name and role. Keep it under 300 characters.",
      inputFields: [
        {
          key: "name",
          label: "Name",
          type: "text",
          required: true,
          placeholder: "Alex Chen",
        },
        {
          key: "role",
          label: "Role",
          type: "text",
          required: true,
          placeholder: "Backend Engineer",
        },
      ],
    },
  },
] as const;

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await db.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash },
    create: {
      name: "Demo User",
      email: DEMO_EMAIL,
      passwordHash,
    },
  });

  let workspace = await db.workspace.findFirst({
    where: { ownerId: user.id, name: "Demo Workspace" },
  });

  if (!workspace) {
    workspace = await db.$transaction(async (tx) => {
      const created = await tx.workspace.create({
        data: { name: "Demo Workspace", ownerId: user.id },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          workspaceId: created.id,
          role: MembershipRole.OWNER,
        },
      });

      return created;
    });
  }

  for (const workflow of DEMO_WORKFLOWS) {
    const existing = await db.workflow.findFirst({
      where: { workspaceId: workspace.id, name: workflow.name },
    });

    if (!existing) {
      await db.workflow.create({
        data: {
          name: workflow.name,
          definition: workflow.definition,
          workspaceId: workspace.id,
          createdById: user.id,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
