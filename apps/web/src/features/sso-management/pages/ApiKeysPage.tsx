import { Box, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { ApiKeyList, ApiKeyForm } from "../components";

export function ApiKeysPage() {
  return (
    <Box>
      <Box mb={3}>
        <Breadcrumbs>
          <MuiLink component={Link} to="/sso-management" underline="hover" color="inherit">
            SSO Yönetimi
          </MuiLink>
          <Typography color="text.primary">API Anahtarları</Typography>
        </Breadcrumbs>
      </Box>

      <ApiKeyList />
      <ApiKeyForm />
    </Box>
  );
}

export default ApiKeysPage;
