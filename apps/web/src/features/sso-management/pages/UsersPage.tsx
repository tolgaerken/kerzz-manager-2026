import { Box, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { UserList, UserForm, UserLicenseModal } from "../components";

export function UsersPage() {
  return (
    <Box>
      <Box mb={3}>
        <Breadcrumbs>
          <MuiLink component={Link} to="/sso-management" underline="hover" color="inherit">
            SSO Yönetimi
          </MuiLink>
          <Typography color="text.primary">Kullanıcılar</Typography>
        </Breadcrumbs>
      </Box>

      <UserList />
      <UserForm />
      <UserLicenseModal />
    </Box>
  );
}

export default UsersPage;
