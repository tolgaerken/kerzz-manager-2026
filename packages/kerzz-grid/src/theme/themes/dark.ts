import type { ResolvedGridTheme } from '../../types/theme.types';

export const darkTheme: ResolvedGridTheme = {
  colors: {
    bg: '#0f172a',
    headerBg: '#1e293b',
    headerFg: '#e2e8f0',
    rowBg: '#0f172a',
    rowAltBg: '#1e293b',
    rowHover: '#334155',
    rowSelected: '#1e3a5f',
    border: '#334155',
    primary: '#60a5fa',
    primaryHover: '#93bbfc',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    footerBg: '#1e293b',
    footerFg: '#cbd5e1',
    scrollbarThumb: '#475569',
    scrollbarTrack: '#1e293b',
    filterBg: '#1e293b',
    filterBorder: '#334155',
    filterActive: '#60a5fa',
    resizeHandle: '#64748b',
    focusRing: '#60a5fa',
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
