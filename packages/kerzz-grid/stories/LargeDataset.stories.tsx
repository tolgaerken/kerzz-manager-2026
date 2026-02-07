import React, { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from '../src';
import type { GridColumnDef } from '../src';

interface DataRow {
  id: number;
  name: string;
  category: string;
  value: number;
  quantity: number;
  status: string;
  date: string;
  region: string;
}

const categories = ['Elektronik', 'Giyim', 'Gıda', 'Mobilya', 'Kozmetik', 'Kitap', 'Spor', 'Oyuncak'];
const statuses = ['Aktif', 'Pasif', 'Beklemede', 'İptal'];
const regions = ['Marmara', 'Ege', 'Akdeniz', 'İç Anadolu', 'Karadeniz', 'Doğu Anadolu', 'Güneydoğu'];

function generateData(count: number): DataRow[] {
  const data: DataRow[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: i + 1,
      name: `Ürün ${i + 1}`,
      category: categories[i % categories.length],
      value: Math.round(Math.random() * 10000 * 100) / 100,
      quantity: Math.floor(Math.random() * 500),
      status: statuses[i % statuses.length],
      date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      region: regions[i % regions.length],
    });
  }
  return data;
}

const columns: GridColumnDef<DataRow>[] = [
  { id: 'id', header: 'ID', accessorKey: 'id', width: 70, align: 'center', sortable: true },
  { id: 'name', header: 'Ürün Adı', accessorKey: 'name', width: 160, sortable: true, filter: { type: 'input', conditions: ['contains', 'startsWith'] } },
  { id: 'category', header: 'Kategori', accessorKey: 'category', width: 130, sortable: true, filter: { type: 'dropdown', showCounts: true } },
  { id: 'value', header: 'Değer', accessorKey: 'value', width: 120, align: 'right', sortable: true, cell: (v) => `₺${Number(v).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, footer: { aggregate: 'sum', format: (v) => `₺${v.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` }, filter: { type: 'input', conditions: ['greaterThan', 'lessThan', 'between'] } },
  { id: 'quantity', header: 'Miktar', accessorKey: 'quantity', width: 100, align: 'right', sortable: true, footer: { aggregate: 'sum' } },
  { id: 'status', header: 'Durum', accessorKey: 'status', width: 110, sortable: true, filter: { type: 'dropdown', showCounts: true } },
  { id: 'date', header: 'Tarih', accessorKey: 'date', width: 120, sortable: true, filter: { type: 'dateTree' } },
  { id: 'region', header: 'Bölge', accessorKey: 'region', width: 130, sortable: true, filter: { type: 'dropdown', showCounts: true }, footer: { aggregate: 'distinctCount' } },
];

function LargeDatasetGrid({ rowCount }: { rowCount: number }) {
  const data = useMemo(() => generateData(rowCount), [rowCount]);

  return (
    <div>
      <p style={{ marginBottom: 8, fontSize: 14, color: '#666' }}>
        {rowCount.toLocaleString()} satır veri - sanal kaydırma ile yüksek performans
      </p>
      <Grid<DataRow>
        data={data}
        columns={columns}
        locale="tr"
        height={600}
        stripedRows
        stateKey={`large-dataset-${rowCount}`}
        toolbar={{ exportFileName: `urunler-${rowCount}` }}
      />
    </div>
  );
}

const meta: Meta = {
  title: 'Grid/Large Dataset',
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

export const TenThousandRows: Story = {
  render: () => <LargeDatasetGrid rowCount={10_000} />,
};

export const FiftyThousandRows: Story = {
  render: () => <LargeDatasetGrid rowCount={50_000} />,
};

export const HundredThousandRows: Story = {
  render: () => <LargeDatasetGrid rowCount={100_000} />,
};
