import { Box, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { PermissionList, PermissionForm } from "../components";

export function PermissionsPage() {
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
          <Typography sx={{ color: "var(--color-foreground)" }}>İzinler</Typography>
        </Breadcrumbs>
      </Box>

      <PermissionList />
      <PermissionForm />
    </Box>
  );
}

export default PermissionsPage;
