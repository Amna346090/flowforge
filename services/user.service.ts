import { db } from "@/lib/db";

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export async function createUser(data: {
  name: string;
  email: string;
  image?: string;
}) {
  return db.user.create({ data });
}

export async function updateUser(
  id: string,
  data: Partial<{ name: string; image: string }>
) {
  return db.user.update({ where: { id }, data });
}
