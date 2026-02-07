import type { GridColumnDef } from '../types/column.types';

/**
 * Extract raw cell value from a row using column accessor.
 */
function getCellValue<TData>(row: TData, column: GridColumnDef<TData>): unknown {
  if (column.accessorFn) return column.accessorFn(row);
  const key = column.accessorKey ?? column.id;
  return (row as Record<string, unknown>)[key];
}

/**
 * Escape a value for CSV (handles commas, quotes, newlines).
 */
function escapeCsvValue(value: unknown): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export grid data as a CSV file download.
 */
export function exportToCsv<TData>(
  data: TData[],
  columns: GridColumnDef<TData>[],
  fileName = 'grid-export',
): void {
  // Header row
  const headerRow = columns.map((col) => escapeCsvValue(col.header)).join(',');

  // Data rows
  const dataRows = data.map((row) =>
    columns.map((col) => escapeCsvValue(getCellValue(row, col))).join(','),
  );

  // BOM for Turkish character support in Excel
  const bom = '\uFEFF';
  const csvContent = bom + [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
