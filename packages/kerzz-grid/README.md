# @kerzz/grid

Yuksek performansli, esnek temali, coklu dil destekli React data grid bileseni.

## Ozellikler

- **Yuksek Performans**: TanStack Virtual ile satir sanalastirma (100K+ satir)
- **Esnek Tema Sistemi**: CSS degiskenleri tabanli, herhangi bir projeye uyarlanabilir
- **Coklu Dil Destegi**: Turkce ve Ingilizce dahili, ozel dil ekleme destegi
- **Filtreleme**: Dropdown (coklu secim, satir adetleri, boslar) ve kosul bazli input filter
- **Siralama**: Tek tik siralama (artan/azalan/temizle)
- **Kolon Yonetimi**: Surukle-birak ile sira degistirme, boyutlandirma, goster/gizle
- **Footer Aggregation**: Toplam, ortalama, adet, min, max, benzersiz sayi
- **State Persistence**: localStorage ile kademeli durum saklama
- **TypeScript**: Tam tip guvenligi

## Kurulum

```bash
npm install @kerzz/grid
# veya
pnpm add @kerzz/grid
# veya
yarn add @kerzz/grid
```

## Hizli Baslangic

```tsx
import { Grid } from '@kerzz/grid';
import '@kerzz/grid/styles.css';
import type { GridColumnDef } from '@kerzz/grid';

interface User {
  id: number;
  name: string;
  email: string;
  salary: number;
}

const columns: GridColumnDef<User>[] = [
  { id: 'name', header: 'Isim', accessorKey: 'name', width: 200, sortable: true },
  { id: 'email', header: 'E-posta', accessorKey: 'email', width: 250 },
  {
    id: 'salary',
    header: 'Maas',
    accessorKey: 'salary',
    width: 150,
    align: 'right',
    footer: { aggregate: 'sum', format: (v) => `${v.toLocaleString('tr-TR')} TL` },
  },
];

function App() {
  return (
    <Grid<User>
      data={users}
      columns={columns}
      locale="tr"
      height={500}
      stripedRows
    />
  );
}
```

## Tema Ozellestirme

```tsx
import { Grid, createTheme } from '@kerzz/grid';

const myTheme = createTheme({
  colors: {
    primary: '#10b981',
    headerBg: '#ecfdf5',
    rowHover: '#d1fae5',
    border: '#a7f3d0',
  },
});

<Grid theme={myTheme} ... />
```

## Filtre Kullanimi

```tsx
const columns = [
  {
    id: 'city',
    header: 'Sehir',
    accessorKey: 'city',
    filter: {
      type: 'dropdown',      // Coklu secim dropdown
      showBlanks: true,       // Boslari goster secenegi
      showCounts: true,       // Her deger icin satir adedi
    },
  },
  {
    id: 'salary',
    header: 'Maas',
    accessorKey: 'salary',
    filter: {
      type: 'input',          // Kosul bazli input
      conditions: ['greaterThan', 'lessThan', 'between', 'equals'],
    },
  },
];
```

## State Persistence

```tsx
<Grid
  stateKey="my-unique-grid"         // Her grid icin benzersiz anahtar
  stateStorage="localStorage"       // localStorage | sessionStorage | none
  ...
/>
```

Kaydedilen state: kolon genislikleri, kolon sirasi, kolon gorunurlugu, siralama, filtreler.

## API

### Grid Props

| Prop | Tip | Varsayilan | Aciklama |
|------|-----|-----------|----------|
| `data` | `TData[]` | - | Gosterilecek veri dizisi |
| `columns` | `GridColumnDef<TData>[]` | - | Kolon tanimlari |
| `height` | `number` | `500` | Grid yuksekligi (px) |
| `width` | `string \| number` | `'100%'` | Grid genisligi |
| `locale` | `'tr' \| 'en'` | `'tr'` | Dil |
| `theme` | `GridTheme` | light | Tema override |
| `loading` | `boolean` | `false` | Yukleniyor durumu |
| `stateKey` | `string` | - | State saklama anahtari |
| `stateStorage` | `string` | `'localStorage'` | Saklama tipi |
| `stripedRows` | `boolean` | `false` | Cizgili satirlar |
| `overscan` | `number` | `10` | Virtual scroll buffer |
| `onRowClick` | `(row, index) => void` | - | Satir tiklama |
| `onRowDoubleClick` | `(row, index) => void` | - | Cift tiklama |
| `onSortChange` | `(sorting) => void` | - | Siralama degisimi |
| `onFilterChange` | `(filters) => void` | - | Filtre degisimi |

### GridColumnDef

| Prop | Tip | Aciklama |
|------|-----|----------|
| `id` | `string` | Benzersiz kolon ID |
| `header` | `string` | Baslik metni |
| `accessorKey` | `string` | Veri erisim anahtari |
| `width` | `number` | Kolon genisligi (px) |
| `minWidth` | `number` | Minimum genislik |
| `resizable` | `boolean` | Boyutlandirabilir mi |
| `sortable` | `boolean` | Siralanabilir mi |
| `draggable` | `boolean` | Tasianabilir mi |
| `hideable` | `boolean` | Gizlenebilir mi |
| `filter` | `ColumnFilterConfig` | Filtre yapilandirmasi |
| `footer` | `FooterConfig` | Footer aggregation |
| `align` | `'left' \| 'center' \| 'right'` | Metin hizalama |
| `cell` | `(value, row) => ReactNode` | Ozel hucre render |

## Gelistirme

```bash
# Bagimliliklari yukle
pnpm install

# Storybook ile gelistirme
pnpm dev

# Build
pnpm build

# Test
pnpm test
```

## Lisans

MIT
