import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "name is required").max(100),
  email: z.email("invalid email"),
  password: z.string().min(8, "password must be at least 8 characters"),
});
