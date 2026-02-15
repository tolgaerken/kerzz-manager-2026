import { Box, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { ApplicationList, ApplicationForm } from "../components";

export function ApplicationsPage() {
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
          <Typography sx={{ color: "var(--color-foreground)" }}>Uygulamalar</Typography>
        </Breadcrumbs>
      </Box>

      <ApplicationList />
      <ApplicationForm />
    </Box>
  );
}

export default ApplicationsPage;
