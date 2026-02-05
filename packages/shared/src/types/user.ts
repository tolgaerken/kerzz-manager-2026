import type { RbacRole } from "../rbac/roles";

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: RbacRole;
}
