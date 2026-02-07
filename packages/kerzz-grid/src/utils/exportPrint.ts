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
 * Escape HTML special characters.
 */
function escapeHtml(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Open a print dialog with a styled HTML table for PDF-like export.
 */
export function exportToPrint<TData>(
  data: TData[],
  columns: GridColumnDef<TData>[],
  title?: string,
): void {
  const headerCells = columns
    .map(
      (col) =>
        `<th style="padding:6px 10px;text-align:${col.align ?? 'left'};border-bottom:2px solid #333;font-size:12px;white-space:nowrap;">${escapeHtml(col.header)}</th>`,
    )
    .join('');

  const dataRows = data
    .map((row, idx) => {
      const cells = columns
        .map(
          (col) =>
            `<td style="padding:5px 10px;text-align:${col.align ?? 'left'};border-bottom:1px solid #ddd;font-size:11px;">${escapeHtml(getCellValue(row, col))}</td>`,
        )
        .join('');
      const bg = idx % 2 === 1 ? ' style="background:#f9f9f9;"' : '';
      return `<tr${bg}>${cells}</tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title ?? 'Export')}</title>
  <style>
    @media print {
      @page { margin: 10mm; size: landscape; }
      body { margin: 0; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; }
    h2 { font-size: 16px; margin: 0 0 12px 0; color: #1e293b; }
    table { border-collapse: collapse; width: 100%; }
    .meta { font-size: 11px; color: #666; margin-bottom: 8px; }
  </style>
</head>
<body>
  ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
  <div class="meta">${data.length} kayıt &bull; ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${dataRows}</tbody>
  </table>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=600');
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to render, then trigger print
  printWindow.addEventListener('load', () => {
    printWindow.focus();
    printWindow.print();
  });
}
