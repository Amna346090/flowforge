import { db } from "@/lib/db";
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspaceById,
  listUserWorkspaces,
} from "@/services/workspace.service";

async function main() {
  // ── Setup: create two users ──────────────────────────────────────────
  const userA = await db.user.upsert({
    where: { email: "usera@flowforge.dev" },
    update: {},
    create: { name: "User A", email: "usera@flowforge.dev" },
  });

  const userB = await db.user.upsert({
    where: { email: "userb@flowforge.dev" },
    update: {},
    create: { name: "User B", email: "userb@flowforge.dev" },
  });

  console.log("✅ Setup: users created", { userA: userA.id, userB: userB.id });

  // ── 1. createWorkspace ───────────────────────────────────────────────
  const ws = await createWorkspace(userA.id, "Test Workspace");
  console.log("✅ createWorkspace:", ws);

  // ── 2. getWorkspaceById (authorized) ────────────────────────────────
  const found = await getWorkspaceById(userA.id, ws.id);
  console.log("✅ getWorkspaceById (authorized):", found);

  // ── 3. getWorkspaceById (unauthorized — userB has no membership) ─────
  try {
    await getWorkspaceById(userB.id, ws.id);
    console.log("❌ Should have thrown — userB is not a member");
  } catch (e: any) {
    console.log("✅ getWorkspaceById (unauthorized) correctly threw:", e.message);
  }

  // ── 4. listUserWorkspaces ────────────────────────────────────────────
  const wsListA = await listUserWorkspaces(userA.id);
  console.log(`✅ listUserWorkspaces (userA): ${wsListA.length} workspace(s)`, wsListA.map(w => w.name));

  const wsListB = await listUserWorkspaces(userB.id);
  console.log(`✅ listUserWorkspaces (userB): ${wsListB.length} workspace(s) — should be 0`);

  // ── 5. deleteWorkspace (unauthorized — userB is not OWNER) ──────────
  try {
    await deleteWorkspace(userB.id, ws.id);
    console.log("❌ Should have thrown — userB is not a member");
  } catch (e: any) {
    console.log("✅ deleteWorkspace (unauthorized) correctly threw:", e.message);
  }

  // ── 6. deleteWorkspace (authorized — userA is OWNER) ────────────────
  await deleteWorkspace(userA.id, ws.id);
  console.log("✅ deleteWorkspace: workspace deleted");

  // ── Cleanup ──────────────────────────────────────────────────────────
  await db.user.deleteMany({ where: { email: { in: ["usera@flowforge.dev", "userb@flowforge.dev"] } } });
  console.log("✅ Cleanup done");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  });
