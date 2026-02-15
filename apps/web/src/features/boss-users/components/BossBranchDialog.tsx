import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box } from "@mui/material";
import { X } from "lucide-react";
import { BossBranchManager } from "./BossBranchManager";
import type { BossLicenseUser } from "../types";

interface BossBranchDialogProps {
  open: boolean;
  license: BossLicenseUser | null;
  onClose: () => void;
}

export function BossBranchDialog({ open, license, onClose }: BossBranchDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "var(--color-surface)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)"
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid var(--color-border)" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="span" sx={{ color: "var(--color-foreground)" }}>
            Şube Yetkileri {license?.brand ? `- ${license.brand}` : ""}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            edge="end"
            sx={{ color: "var(--color-muted-foreground)" }}
          >
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ p: 3, bgcolor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {license ? <BossBranchManager license={license} /> : null}
      </DialogContent>
    </Dialog>
  );
}
