import { Box } from "@mui/material";
import { TitleList } from "../components";

export function OrgTitlesPage() {
  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "var(--color-surface)",
        minHeight: "100%",
      }}
    >
      <TitleList />
    </Box>
  );
}

export default OrgTitlesPage;
