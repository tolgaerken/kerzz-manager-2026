import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from '../src';
import type { GridColumnDef } from '../src';

interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  revenue: number;
  orders: number;
  lastOrder: string;
  status: string;
}

const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Adana', 'Gaziantep', 'Kayseri', 'Mersin'];
const statuses = ['Aktif', 'Pasif', 'VIP', 'Yeni'];
const companies = ['ABC Ltd.', 'XYZ A.Ş.', 'Demo Corp.', 'Test Inc.', 'Kerzz Tech', 'Mega Store', 'Mini Market', 'Super Shop'];

const data: Customer[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  name: `Müşteri ${i + 1}`,
  company: companies[i % companies.length],
  email: `musteri${i + 1}@${['gmail.com', 'outlook.com', 'company.com'][i % 3]}`,
  phone: `0${5 + (i % 4)}xx xxx xx ${String(i).padStart(2, '0')}`,
  city: cities[i % cities.length],
  revenue: Math.round(Math.random() * 100000 * 100) / 100,
  orders: Math.floor(Math.random() * 50),
  lastOrder: new Date(2024 + Math.floor(i / 100), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
  status: statuses[i % statuses.length],
}));

// Add some blanks
data[3] = { ...data[3], city: '', status: '' };
data[7] = { ...data[7], city: '', company: '' };
data[15] = { ...data[15], email: '' };

const columns: GridColumnDef<Customer>[] = [
  {
    id: 'id',
    header: 'ID',
    accessorKey: 'id',
    width: 60,
    align: 'center',
    sortable: true,
    resizable: true,
    hideable: false,
  },
  {
    id: 'name',
    header: 'Müşteri Adı',
    accessorKey: 'name',
    width: 150,
    sortable: true,
    resizable: true,
    filter: { type: 'input', conditions: ['contains', 'startsWith', 'equals'] },
    footer: { aggregate: 'count', label: 'Toplam' },
  },
  {
    id: 'company',
    header: 'Firma',
    accessorKey: 'company',
    width: 140,
    sortable: true,
    filter: { type: 'dropdown', showBlanks: true, showCounts: true },
  },
  {
    id: 'email',
    header: 'E-posta',
    accessorKey: 'email',
    width: 220,
    filter: { type: 'input', conditions: ['contains', 'endsWith'] },
  },
  {
    id: 'phone',
    header: 'Telefon',
    accessorKey: 'phone',
    width: 150,
  },
  {
    id: 'city',
    header: 'Şehir',
    accessorKey: 'city',
    width: 120,
    sortable: true,
    filter: { type: 'dropdown', showBlanks: true, showCounts: true },
    footer: { aggregate: 'distinctCount' },
  },
  {
    id: 'revenue',
    header: 'Ciro',
    accessorKey: 'revenue',
    width: 140,
    align: 'right',
    sortable: true,
    cell: (v) => `₺${Number(v).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
    filter: { 
      type: 'numeric',
      conditions: ['greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual', 'between', 'equals']
    },
    footer: { aggregate: 'sum', format: (v) => `₺${v.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` },
  },
  {
    id: 'orders',
    header: 'Sipariş',
    accessorKey: 'orders',
    width: 90,
    align: 'right',
    sortable: true,
    filter: { 
      type: 'numeric',
      conditions: ['equals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual']
    },
    footer: { aggregate: 'avg', format: (v) => v.toFixed(1) },
  },
  {
    id: 'lastOrder',
    header: 'Son Sipariş',
    accessorKey: 'lastOrder',
    width: 120,
    sortable: true,
    cell: (v) => new Date(String(v)).toLocaleDateString('tr-TR'),
    filter: { type: 'dateTree' },
  },
  {
    id: 'status',
    header: 'Durum',
    accessorKey: 'status',
    width: 100,
    sortable: true,
    filter: { type: 'dropdown', showBlanks: true, showCounts: true },
    cell: (v) => {
      const colors: Record<string, string> = {
        Aktif: '#10b981',
        Pasif: '#ef4444',
        VIP: '#8b5cf6',
        Yeni: '#3b82f6',
      };
      const color = colors[String(v)] ?? '#666';
      return (
        <span style={{ color, fontWeight: 600 }}>{String(v) || '—'}</span>
      );
    },
  },
];

const meta: Meta = {
  title: 'Grid/Full Feature',
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

export const AllFeatures: Story = {
  render: () => (
    <div>
      <h3 style={{ marginBottom: 8, fontSize: 16 }}>Müşteri Yönetimi - Tüm Özellikler</h3>
      <p style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
        Toolbar, Excel/PDF export, custom butonlar, sıralama, dropdown/input/dateTree/numeric filter, kolon taşıma, boyutlandırma, gizle/göster, footer aggregation
      </p>
      <Grid<Customer>
        data={data}
        columns={columns}
        locale="tr"
        height={550}
        stripedRows
        stateKey="full-feature-demo"
        toolbar={{
          exportFileName: 'musteriler',
          customButtons: [
            {
              id: 'add',
              label: 'Yeni Müşteri',
              variant: 'primary',
              icon: <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>,
              onClick: () => alert('Yeni müşteri ekleme formu açılır'),
            },
            {
              id: 'delete',
              label: 'Seçilenleri Sil',
              variant: 'danger',
              disabled: true,
              onClick: () => {},
            },
          ],
        }}
        onRowClick={(row) => console.log('Click:', row)}
        onRowDoubleClick={(row) => console.log('Double click:', row)}
      />
    </div>
  ),
};
