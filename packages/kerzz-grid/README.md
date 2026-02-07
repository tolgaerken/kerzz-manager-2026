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
- **Satir Ekleme (Inline Add Row)**: Edit modunda toolbar'dan yeni satir ekleme, otomatik focus ve Tab/Enter ile hucre navigasyonu
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

## Satir Ekleme (Inline Row Adding)

Grid edit modundayken toolbar'da "+" butonu gorunur. Bu buton ile yeni satir ekleme akisi baslatilir.

### Nasil Calisir

1. Kullanici herhangi bir hucreye cift tiklayarak edit moduna girer (veya programatik olarak)
2. Toolbar'da "+" (Satir Ekle) butonu gorunur hale gelir
3. Butona tiklandiginda `onRowAdd` callback'i tetiklenir
4. Parent bilesen yeni satiri `data` dizisine ekler
5. Grid otomatik olarak yeni satirin ilk editable hucresini edit moduna gecirir ve focus verir
6. **Tab** veya **Enter** tuslari ile siradaki editable hucreye gecilir
7. Satirdaki tum editable hucreler tamamlandiginda sonraki satirin ilk editable hucresine gecilir

### Klavye Navigasyonu

| Tus | Davranis |
|-----|----------|
| `Tab` | Mevcut hucreyi kaydeder, ayni satirda sonraki editable hucreye gecer. Satir biterse sonraki satira gecer. |
| `Enter` | `Tab` ile ayni davranis -- kaydeder ve sonraki editable hucreye gecer. |
| `Escape` | Duzenlemeyi iptal eder, hucreyi kapatir. |

### Ornek Kullanim

```tsx
import { Grid } from '@kerzz/grid';
import type { GridColumnDef } from '@kerzz/grid';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

const columns: GridColumnDef<Product>[] = [
  {
    id: 'name',
    header: 'Urun Adi',
    accessorKey: 'name',
    width: 200,
    editable: true,
    cellEditor: { type: 'text' },
  },
  {
    id: 'price',
    header: 'Fiyat',
    accessorKey: 'price',
    width: 120,
    align: 'right',
    editable: true,
    cellEditor: { type: 'number' },
  },
  {
    id: 'category',
    header: 'Kategori',
    accessorKey: 'category',
    width: 150,
    editable: true,
    cellEditor: {
      type: 'select',
      options: [
        { id: 'food', name: 'Yiyecek' },
        { id: 'drink', name: 'Icecek' },
      ],
    },
  },
];

function App() {
  const [products, setProducts] = useState<Product[]>([]);

  const handleRowAdd = () => {
    // Yeni bos satir olustur
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: '',
      price: 0,
      category: '',
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const handleCellChange = (
    row: Product,
    columnId: string,
    newValue: unknown,
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === row.id ? { ...p, [columnId]: newValue } : p,
      ),
    );
  };

  return (
    <Grid<Product>
      data={products}
      columns={columns}
      height={400}
      locale="tr"
      onRowAdd={handleRowAdd}
      onCellValueChange={handleCellChange}
    />
  );
}
```

### Toolbar Yapilandirmasi

`showAddRow` secenegi ile "+" butonu kontrol edilebilir:

```tsx
<Grid
  toolbar={{ showAddRow: false }}  // "+" butonunu gizle
  ...
/>
```

Varsayilan olarak `showAddRow` aciktir (`true`). Buton sadece edit modu aktifken ve `onRowAdd` callback'i verildiginde gorunur.

### Programatik Satir Ekleme (GridRef)

`GridRef` uzerinden de satir ekleme tetiklenebilir:

```tsx
const gridRef = useRef<GridRef>(null);

// ...
gridRef.current?.addRow(); // onRowAdd callback'ini tetikler
```

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
| `onRowAdd` | `() => void` | - | Satir ekleme butonuna tiklandiginda tetiklenir |
| `onCellValueChange` | `(row, columnId, newValue, oldValue) => void` | - | Hucre degeri degistiginde tetiklenir |

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
| `editable` | `boolean \| (row) => boolean` | Hucre duzenlenebilir mi |
| `cellEditor` | `CellEditorConfig` | Editor yapilandirmasi (text, number, select, boolean, custom) |

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
