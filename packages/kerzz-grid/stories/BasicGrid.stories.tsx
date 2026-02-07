import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from '../src';
import type { GridColumnDef } from '../src';

interface Person {
  id: number;
  name: string;
  age: number;
  city: string;
  email: string;
  salary: number;
  createdAt: string;
}

const sampleData: Person[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Kullanıcı ${i + 1}`,
  age: 20 + (i % 40),
  city: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'][i % 5],
  email: `user${i + 1}@example.com`,
  salary: 5000 + Math.round(Math.random() * 15000),
  createdAt: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
}));

const columns: GridColumnDef<Person>[] = [
  {
    id: 'id',
    header: 'ID',
    accessorKey: 'id',
    width: 60,
    align: 'center',
    sortable: true,
  },
  {
    id: 'name',
    header: 'İsim',
    accessorKey: 'name',
    width: 180,
    sortable: true,
    filter: { type: 'dropdown', showBlanks: true, showCounts: true },
    footer: { aggregate: 'count' },
  },
  {
    id: 'age',
    header: 'Yaş',
    accessorKey: 'age',
    width: 80,
    align: 'right',
    sortable: true,
    filter: {
      type: 'input',
      conditions: ['equals', 'greaterThan', 'lessThan', 'between'],
    },
    footer: { aggregate: 'avg', format: (v) => v.toFixed(1) },
  },
  {
    id: 'city',
    header: 'Şehir',
    accessorKey: 'city',
    width: 140,
    sortable: true,
    filter: { type: 'dropdown', showCounts: true },
    footer: { aggregate: 'distinctCount' },
  },
  {
    id: 'email',
    header: 'E-posta',
    accessorKey: 'email',
    width: 220,
    filter: { type: 'input', conditions: ['contains', 'startsWith', 'endsWith'] },
  },
  {
    id: 'salary',
    header: 'Maaş',
    accessorKey: 'salary',
    width: 130,
    align: 'right',
    sortable: true,
    cell: (value) => `₺${Number(value).toLocaleString('tr-TR')}`,
    filter: {
      type: 'input',
      conditions: ['equals', 'greaterThan', 'lessThan', 'between'],
    },
    footer: {
      aggregate: 'sum',
      format: (v) => `₺${v.toLocaleString('tr-TR')}`,
    },
  },
  {
    id: 'createdAt',
    header: 'Kayıt Tarihi',
    accessorKey: 'createdAt',
    width: 130,
    sortable: true,
    cell: (v) => new Date(String(v)).toLocaleDateString('tr-TR'),
    filter: { type: 'dateTree' },
  },
];

const meta: Meta<typeof Grid<Person>> = {
  title: 'Grid/Basic',
  component: Grid as React.ComponentType,
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Grid<Person>
      data={sampleData}
      columns={columns}
      locale="tr"
      height={500}
      stripedRows
      toolbar
    />
  ),
};

export const EnglishLocale: Story = {
  render: () => (
    <Grid<Person>
      data={sampleData}
      columns={columns}
      locale="en"
      height={500}
      stripedRows
      toolbar
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <Grid<Person>
      data={[]}
      columns={columns}
      locale="tr"
      height={400}
      loading
    />
  ),
};

export const NoData: Story = {
  render: () => (
    <Grid<Person>
      data={[]}
      columns={columns}
      locale="tr"
      height={400}
    />
  ),
};
