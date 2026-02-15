import { Box } from "@mui/material";
import { LocationList } from "../components";

export function OrgLocationsPage() {
  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "var(--color-surface)",
        minHeight: "100%",
      }}
    >
      <LocationList />
    </Box>
  );
}

export default OrgLocationsPage;
