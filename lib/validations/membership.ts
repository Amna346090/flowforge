import { z } from "zod";
import { MembershipRole } from "@/generated/prisma/client";

const membershipRoleSchema = z.nativeEnum(MembershipRole, {
  error: "role must be one of: OWNER, ADMIN, MEMBER",
});

export const addMemberSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  role: membershipRoleSchema,
});

export const updateMemberRoleSchema = z.object({
  role: membershipRoleSchema,
});
