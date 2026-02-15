import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box
} from "@mui/material";
import { X } from "lucide-react";

interface SsoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

export function SsoModal({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true
}: SsoModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          backgroundColor: "var(--color-surface)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)"
        }
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid var(--color-border)"
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="span" sx={{ color: "var(--color-foreground)" }}>
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            edge="end"
            sx={{
              color: "var(--color-muted-foreground)",
              "&:hover": {
                backgroundColor: "var(--color-surface-hover)"
              }
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          borderColor: "var(--color-border)"
        }}
      >
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid var(--color-border)"
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}

export default SsoModal;
