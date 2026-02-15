import { Box, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { UserList, UserForm, AddUserForm, UserLicenseModal } from "../components";

export function UsersPage() {
  return (
    <Box>
      <Box mb={3}>
        <Breadcrumbs>
          <MuiLink component={Link} to="/sso-management" underline="hover" color="inherit">
            SSO Yönetimi
          </MuiLink>
          <Typography sx={{ color: "var(--color-foreground)" }}>Kullanıcılar</Typography>
        </Breadcrumbs>
      </Box>

      <UserList />
      <UserForm />
      <AddUserForm />
      <UserLicenseModal />
    </Box>
  );
}

export default UsersPage;
