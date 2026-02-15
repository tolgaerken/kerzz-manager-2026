import { Box } from "@mui/material";
import { DepartmentList } from "../components";

export function OrgDepartmentsPage() {
  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "var(--color-surface)",
        minHeight: "100%",
      }}
    >
      <DepartmentList />
    </Box>
  );
}

export default OrgDepartmentsPage;
