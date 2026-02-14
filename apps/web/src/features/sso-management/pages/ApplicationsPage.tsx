import { Box, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { ApplicationList, ApplicationForm } from "../components";

export function ApplicationsPage() {
  return (
    <Box>
      <Box mb={3}>
        <Breadcrumbs>
          <MuiLink component={Link} to="/sso-management" underline="hover" color="inherit">
            SSO Yönetimi
          </MuiLink>
          <Typography color="text.primary">Uygulamalar</Typography>
        </Breadcrumbs>
      </Box>

      <ApplicationList />
      <ApplicationForm />
    </Box>
  );
}

export default ApplicationsPage;
