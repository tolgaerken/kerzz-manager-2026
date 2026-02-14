import { Box, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { RoleList, RoleForm } from "../components";
import { PermissionMatrix } from "../components/permissions/PermissionMatrix";

export function RolesPage() {
  return (
    <Box>
      <Box mb={3}>
        <Breadcrumbs>
          <MuiLink component={Link} to="/sso-management" underline="hover" color="inherit">
            SSO Yönetimi
          </MuiLink>
          <Typography color="text.primary">Roller</Typography>
        </Breadcrumbs>
      </Box>

      <RoleList />
      <RoleForm />
      <PermissionMatrix />
    </Box>
  );
}

export default RolesPage;
