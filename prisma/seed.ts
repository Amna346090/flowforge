import { db } from "@/lib/db";

async function main() {
  await db.user.create({
    data: { id: "u1", name: "Test User", email: "test@test.com" },
  });
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
