import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Grid, createTheme, darkTheme } from '../src';
import type { GridColumnDef, GridTheme } from '../src';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  addedAt: string;
}

const data: Product[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Ürün ${i + 1}`,
  price: Math.round(Math.random() * 5000 * 100) / 100,
  stock: Math.floor(Math.random() * 200),
  category: ['Elektronik', 'Giyim', 'Gıda', 'Mobilya'][i % 4],
  addedAt: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
}));

const columns: GridColumnDef<Product>[] = [
  { id: 'id', header: 'ID', accessorKey: 'id', width: 60, align: 'center' },
  { id: 'name', header: 'Ürün', accessorKey: 'name', width: 180, filter: { type: 'dropdown', showCounts: true } },
  { id: 'price', header: 'Fiyat', accessorKey: 'price', width: 120, align: 'right', cell: (v) => `₺${Number(v).toFixed(2)}`, footer: { aggregate: 'sum', format: (v) => `₺${v.toFixed(2)}` } },
  { id: 'stock', header: 'Stok', accessorKey: 'stock', width: 100, align: 'right', footer: { aggregate: 'sum' } },
  { id: 'category', header: 'Kategori', accessorKey: 'category', width: 130, filter: { type: 'dropdown', showCounts: true }, footer: { aggregate: 'distinctCount' } },
  { id: 'addedAt', header: 'Eklenme Tarihi', accessorKey: 'addedAt', width: 130, sortable: true, cell: (v) => new Date(String(v)).toLocaleDateString('tr-TR'), filter: { type: 'dateTree' } },
];

const greenTheme: GridTheme = {
  colors: {
    primary: '#10b981',
    primaryHover: '#059669',
    headerBg: '#ecfdf5',
    headerFg: '#064e3b',
    rowHover: '#d1fae5',
    rowSelected: '#a7f3d0',
    footerBg: '#ecfdf5',
    border: '#a7f3d0',
    filterActive: '#10b981',
  },
};

const purpleTheme: GridTheme = {
  colors: {
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    headerBg: '#f5f3ff',
    headerFg: '#3b0764',
    rowHover: '#ede9fe',
    rowSelected: '#ddd6fe',
    footerBg: '#f5f3ff',
    border: '#ddd6fe',
    filterActive: '#8b5cf6',
  },
};

const darkThemeOverride: GridTheme = {
  colors: darkTheme.colors,
  fontSize: darkTheme.fontSize,
  spacing: darkTheme.spacing,
  border: darkTheme.border,
  fontFamily: darkTheme.fontFamily,
};

const meta: Meta = {
  title: 'Grid/Theming',
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

export const DefaultLight: Story = {
  render: () => (
    <Grid<Product>
      data={data}
      columns={columns}
      locale="tr"
      height={400}
      stripedRows
      toolbar
    />
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <div style={{ background: '#0f172a', padding: 20 }}>
      <Grid<Product>
        data={data}
        columns={columns}
        locale="tr"
        height={400}
        stripedRows
        theme={darkThemeOverride}
        toolbar
      />
    </div>
  ),
};

export const GreenTheme: Story = {
  render: () => (
    <Grid<Product>
      data={data}
      columns={columns}
      locale="tr"
      height={400}
      stripedRows
      theme={greenTheme}
      toolbar
    />
  ),
};

export const PurpleTheme: Story = {
  render: () => (
    <Grid<Product>
      data={data}
      columns={columns}
      locale="tr"
      height={400}
      stripedRows
      theme={purpleTheme}
      toolbar
    />
  ),
};

export const ThemeSwitcher: Story = {
  render: () => {
    const [activeTheme, setActiveTheme] = useState<string>('light');
    const themes: Record<string, GridTheme | undefined> = {
      light: undefined,
      dark: darkThemeOverride,
      green: greenTheme,
      purple: purpleTheme,
    };

    return (
      <div>
        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          {Object.keys(themes).map((name) => (
            <button
              key={name}
              onClick={() => setActiveTheme(name)}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: activeTheme === name ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                background: activeTheme === name ? '#eff6ff' : '#fff',
                cursor: 'pointer',
                fontWeight: activeTheme === name ? 600 : 400,
              }}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ background: activeTheme === 'dark' ? '#0f172a' : '#fff', padding: activeTheme === 'dark' ? 20 : 0 }}>
          <Grid<Product>
            data={data}
            columns={columns}
            locale="tr"
            height={400}
            stripedRows
            theme={themes[activeTheme]}
            toolbar
          />
        </div>
      </div>
    );
  },
};
