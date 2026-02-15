import { Box, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { ApiKeyList, ApiKeyForm } from "../components";

export function ApiKeysPage() {
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
          <Typography sx={{ color: "var(--color-foreground)" }}>API Anahtarları</Typography>
        </Breadcrumbs>
      </Box>

      <ApiKeyList />
      <ApiKeyForm />
    </Box>
  );
}

export default ApiKeysPage;
