export interface GridThemeColors {
  /** Grid background */
  bg?: string;
  /** Header background */
  headerBg?: string;
  /** Header foreground/text */
  headerFg?: string;
  /** Row background */
  rowBg?: string;
  /** Alternating row background */
  rowAltBg?: string;
  /** Row hover background */
  rowHover?: string;
  /** Selected row background */
  rowSelected?: string;
  /** Border color */
  border?: string;
  /** Primary accent color */
  primary?: string;
  /** Primary hover color */
  primaryHover?: string;
  /** Text color */
  text?: string;
  /** Muted/secondary text */
  textMuted?: string;
  /** Footer background */
  footerBg?: string;
  /** Footer foreground/text */
  footerFg?: string;
  /** Scrollbar thumb color */
  scrollbarThumb?: string;
  /** Scrollbar track color */
  scrollbarTrack?: string;
  /** Filter dropdown background */
  filterBg?: string;
  /** Filter dropdown border */
  filterBorder?: string;
  /** Filter active indicator */
  filterActive?: string;
  /** Resize handle color */
  resizeHandle?: string;
  /** Focus ring color */
  focusRing?: string;
  /** Error color */
  error?: string;
}

export interface GridThemeFontSize {
  header?: string;
  cell?: string;
  footer?: string;
  filter?: string;
}

export interface GridThemeSpacing {
  rowHeight?: number;
  headerHeight?: number;
  footerHeight?: number;
  cellPaddingX?: number;
  cellPaddingY?: number;
}

export interface GridThemeBorder {
  radius?: string;
  width?: string;
}

export interface GridTheme {
  colors?: GridThemeColors;
  fontSize?: GridThemeFontSize;
  spacing?: GridThemeSpacing;
  border?: GridThemeBorder;
  fontFamily?: string;
}

/** Resolved theme with all values filled */
export interface ResolvedGridTheme {
  colors: Required<GridThemeColors>;
  fontSize: Required<GridThemeFontSize>;
  spacing: Required<GridThemeSpacing>;
  border: Required<GridThemeBorder>;
  fontFamily: string;
}
