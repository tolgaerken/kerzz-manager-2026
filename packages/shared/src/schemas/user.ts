import { z } from "zod";
import { RBAC_ROLES } from "../rbac/roles";

export const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(RBAC_ROLES)
});

export type UserSchema = z.infer<typeof userSchema>;
