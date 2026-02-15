import { Box, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { RoleList, RoleForm } from "../components";
import { PermissionMatrix } from "../components/permissions/PermissionMatrix";

export function RolesPage() {
  return (
    <Box>
      <Box mb={3}>
        <Breadcrumbs sx={{ "& .MuiBreadcrumbs-separator": { color: "var(--color-muted-foreground)" } }}>
          <MuiLink
            component={Link}
            to="/sso-management"
            underline="hover"
            sx={{ color: "var(--color-muted-foreground)", "&:hover": { color: "var(--color-primary)" } }}
          >
            SSO Yönetimi
          </MuiLink>
          <Typography sx={{ color: "var(--color-foreground)" }}>Roller</Typography>
        </Breadcrumbs>
      </Box>

      <RoleList />
      <RoleForm />
      <PermissionMatrix />
    </Box>
  );
}

export default RolesPage;
