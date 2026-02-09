import * as XLSX from 'xlsx';
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
 * Convert value to appropriate Excel cell type.
 */
function toExcelValue(value: unknown): string | number | boolean | Date | null {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  if (value instanceof Date) return value;
  return String(value);
}

/**
 * Export grid data as an XLSX (Excel) file download.
 */
export function exportToXlsx<TData>(
  data: TData[],
  columns: GridColumnDef<TData>[],
  fileName = 'grid-export',
): void {
  // Header row
  const headers = columns.map((col) => col.header ?? col.id);

  // Data rows
  const rows = data.map((row) =>
    columns.map((col) => toExcelValue(getCellValue(row, col))),
  );

  // Create worksheet data (header + rows)
  const worksheetData = [headers, ...rows];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Auto-fit column widths based on content
  const colWidths = columns.map((col, colIndex) => {
    const headerLength = String(col.header ?? col.id).length;
    const maxDataLength = rows.reduce((max, row) => {
      const cellValue = row[colIndex];
      const cellLength = cellValue != null ? String(cellValue).length : 0;
      return Math.max(max, cellLength);
    }, 0);
    // Add some padding, min 10, max 50
    return { wch: Math.min(50, Math.max(10, Math.max(headerLength, maxDataLength) + 2)) };
  });
  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
