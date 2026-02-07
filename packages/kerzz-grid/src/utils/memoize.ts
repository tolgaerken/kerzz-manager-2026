/**
 * Simple shallow-equal comparison for objects.
 */
export function shallowEqual<T extends Record<string, unknown>>(
  a: T,
  b: T,
): boolean {
  if (a === b) return true;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

/**
 * Generate CSS custom properties style object from a resolved theme.
 */
export function themeToCssVars(theme: {
  colors: Record<string, string>;
  fontSize: Record<string, string>;
  spacing: Record<string, number>;
  border: Record<string, string>;
  fontFamily: string;
}): React.CSSProperties {
  const vars: Record<string, string> = {};

  // Colors
  const colorMap: Record<string, string> = {
    bg: '--kz-bg',
    headerBg: '--kz-header-bg',
    headerFg: '--kz-header-fg',
    rowBg: '--kz-row-bg',
    rowAltBg: '--kz-row-alt-bg',
    rowHover: '--kz-row-hover',
    rowSelected: '--kz-row-selected',
    border: '--kz-border',
    primary: '--kz-primary',
    primaryHover: '--kz-primary-hover',
    text: '--kz-text',
    textMuted: '--kz-text-muted',
    footerBg: '--kz-footer-bg',
    footerFg: '--kz-footer-fg',
    scrollbarThumb: '--kz-scrollbar-thumb',
    scrollbarTrack: '--kz-scrollbar-track',
    filterBg: '--kz-filter-bg',
    filterBorder: '--kz-filter-border',
    filterActive: '--kz-filter-active',
    resizeHandle: '--kz-resize-handle',
    focusRing: '--kz-focus-ring',
  };

  for (const [key, cssVar] of Object.entries(colorMap)) {
    if (theme.colors[key]) {
      vars[cssVar] = theme.colors[key];
    }
  }

  // Font sizes
  if (theme.fontSize.header) vars['--kz-header-font-size'] = theme.fontSize.header;
  if (theme.fontSize.cell) vars['--kz-font-size'] = theme.fontSize.cell;
  if (theme.fontSize.footer) vars['--kz-footer-font-size'] = theme.fontSize.footer;
  if (theme.fontSize.filter) vars['--kz-filter-font-size'] = theme.fontSize.filter;

  // Spacing
  if (theme.spacing.rowHeight) vars['--kz-row-height'] = `${theme.spacing.rowHeight}px`;
  if (theme.spacing.headerHeight) vars['--kz-header-height'] = `${theme.spacing.headerHeight}px`;
  if (theme.spacing.footerHeight) vars['--kz-footer-height'] = `${theme.spacing.footerHeight}px`;
  if (theme.spacing.cellPaddingX) vars['--kz-cell-padding-x'] = `${theme.spacing.cellPaddingX}px`;
  if (theme.spacing.cellPaddingY) vars['--kz-cell-padding-y'] = `${theme.spacing.cellPaddingY}px`;

  // Border
  if (theme.border.radius) vars['--kz-border-radius'] = theme.border.radius;
  if (theme.border.width) vars['--kz-border-width'] = theme.border.width;

  // Font family
  if (theme.fontFamily) vars['--kz-font-family'] = theme.fontFamily;

  return vars as unknown as React.CSSProperties;
}
