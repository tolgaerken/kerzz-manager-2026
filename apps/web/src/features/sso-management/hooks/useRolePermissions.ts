import { useQuery } from "@tanstack/react-query";
import { rolePermissionsApi } from "../api/ssoApi";

const QUERY_KEY = "sso-role-permissions";

export function useRolePermissions(roleId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, roleId],
    queryFn: () => rolePermissionsApi.getByRole(roleId!),
    enabled: !!roleId
  });
}
