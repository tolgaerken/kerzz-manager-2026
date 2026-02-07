import type { ResolvedGridTheme } from '../../types/theme.types';

export const lightTheme: ResolvedGridTheme = {
  colors: {
    bg: '#ffffff',
    headerBg: '#f8fafc',
    headerFg: '#1e293b',
    rowBg: '#ffffff',
    rowAltBg: '#f8fafc',
    rowHover: '#f1f5f9',
    rowSelected: '#dbeafe',
    border: '#e2e8f0',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    text: '#1e293b',
    textMuted: '#64748b',
    footerBg: '#f1f5f9',
    footerFg: '#334155',
    scrollbarThumb: '#cbd5e1',
    scrollbarTrack: '#f1f5f9',
    filterBg: '#ffffff',
    filterBorder: '#e2e8f0',
    filterActive: '#3b82f6',
    resizeHandle: '#94a3b8',
    focusRing: '#3b82f6',
  },
  fontSize: {
    header: '13px',
    cell: '13px',
    footer: '12px',
    filter: '12px',
  },
  spacing: {
    rowHeight: 36,
    headerHeight: 42,
    footerHeight: 38,
    cellPaddingX: 12,
    cellPaddingY: 4,
  },
  border: {
    radius: '6px',
    width: '1px',
  },
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};
