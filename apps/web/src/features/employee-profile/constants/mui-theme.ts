/**
 * MUI bileşenleri için paylaşımlı tema stilleri.
 * CSS değişkenlerini MUI sx prop'larına eşler.
 * SsoFormField ile tutarlı yaklaşım kullanır.
 */

/**
 * TextField ve FormControl (Select wrapper) için ortak input tema stili.
 * TextField'a doğrudan, FormControl'a (Select sarmalayıcısı) uygulanabilir.
 */
export const muiFieldSx = {
  "& .MuiInputLabel-root": {
    color: "var(--color-muted-foreground)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--color-primary)",
  },
  "& .MuiInputBase-root": {
    backgroundColor: "var(--color-surface-elevated)",
    color: "var(--color-foreground)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--color-border)",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--color-muted-foreground)",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--color-primary)",
  },
  "& .MuiFormHelperText-root": {
    color: "var(--color-error)",
  },
  "& .MuiSelect-icon": {
    color: "var(--color-muted-foreground)",
  },
  "& .MuiInputBase-root.Mui-disabled": {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-muted-foreground)",
    WebkitTextFillColor: "var(--color-muted-foreground)",
  },
  "& .MuiInputLabel-root.Mui-disabled": {
    color: "var(--color-muted-foreground)",
  },
  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--color-border)",
  },
} as const;

/**
 * Select dropdown menüsü (Paper/MenuItem) için tema stili.
 * Select bileşeninin MenuProps prop'una uygulanır.
 */
export const muiSelectMenuProps = {
  PaperProps: {
    sx: {
      backgroundColor: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      "& .MuiMenuItem-root": {
        color: "var(--color-foreground)",
        "&:hover": {
          backgroundColor: "var(--color-surface-hover)",
        },
        "&.Mui-selected": {
          backgroundColor:
            "color-mix(in oklab, var(--color-primary) 18%, transparent)",
          "&:hover": {
            backgroundColor:
              "color-mix(in oklab, var(--color-primary) 25%, transparent)",
          },
        },
      },
    },
  },
} as const;

/** Dialog PaperProps sx stili */
export const muiDialogPaperSx = {
  backgroundColor: "var(--color-surface)",
  color: "var(--color-foreground)",
  border: "1px solid var(--color-border)",
} as const;

/** DialogTitle sx stili */
export const muiDialogTitleSx = {
  borderBottom: "1px solid var(--color-border)",
} as const;

/** DialogContent (dividers) sx stili */
export const muiDialogContentSx = {
  borderColor: "var(--color-border)",
} as const;

/** Tabs bileşeni için tema stili */
export const muiTabsSx = {
  borderBottom: "1px solid var(--color-border)",
  "& .MuiTab-root": {
    color: "var(--color-muted-foreground)",
  },
  "& .Mui-selected": {
    color: "var(--color-primary) !important",
  },
  "& .MuiTabs-indicator": {
    backgroundColor: "var(--color-primary)",
  },
} as const;

/** Divider sx stili */
export const muiDividerSx = {
  borderColor: "var(--color-border)",
} as const;

/** Card sx stili */
export const muiCardSx = {
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
} as const;

/** Skeleton sx stili */
export const muiSkeletonSx = {
  backgroundColor: "var(--color-surface-hover)",
} as const;

/** Primary contained button sx stili */
export const muiPrimaryButtonSx = {
  backgroundColor: "var(--color-primary)",
  color: "var(--color-primary-foreground)",
  "&:hover": {
    backgroundColor:
      "color-mix(in oklab, var(--color-primary) 85%, var(--color-foreground) 15%)",
  },
} as const;

/** Outlined / ghost button sx stili */
export const muiOutlinedButtonSx = {
  color: "var(--color-foreground)",
  borderColor: "var(--color-border)",
  "&:hover": {
    borderColor: "var(--color-primary)",
    backgroundColor: "var(--color-surface-hover)",
  },
} as const;

/** Close / dismiss IconButton sx stili */
export const muiCloseButtonSx = {
  color: "var(--color-muted-foreground)",
  "&:hover": {
    backgroundColor: "var(--color-surface-hover)",
  },
} as const;

/** Info Alert sx stili */
export const muiInfoAlertSx = {
  color: "var(--color-info-foreground)",
  backgroundColor:
    "color-mix(in oklab, var(--color-info) 18%, transparent)",
  border:
    "1px solid color-mix(in oklab, var(--color-info) 40%, transparent)",
  "& .MuiAlert-icon": {
    color: "var(--color-info-foreground)",
  },
} as const;

/** Warning Alert sx stili */
export const muiWarningAlertSx = {
  color: "var(--color-warning-foreground)",
  backgroundColor:
    "color-mix(in oklab, var(--color-warning) 18%, transparent)",
  border:
    "1px solid color-mix(in oklab, var(--color-warning) 40%, transparent)",
  "& .MuiAlert-icon": {
    color: "var(--color-warning-foreground)",
  },
} as const;

/** Error Alert sx stili */
export const muiErrorAlertSx = {
  color: "var(--color-error-foreground)",
  backgroundColor:
    "color-mix(in oklab, var(--color-error) 18%, transparent)",
  border:
    "1px solid color-mix(in oklab, var(--color-error) 40%, transparent)",
  "& .MuiAlert-icon": {
    color: "var(--color-error-foreground)",
  },
} as const;
