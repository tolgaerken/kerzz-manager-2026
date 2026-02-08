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

## Deferred Editing (Ertelemeli Duzenleme)

Grid, tum degisiklikleri (yeni satir ekleme ve mevcut satir duzenleme) dahili olarak yonetir.
Degisiklikler aninda parent'a iletilmez; Kaydet ile commit, Iptal ile tamamen geri alinir.

### Nasil Calisir

1. Kullanici herhangi bir hucreye cift tiklayarak edit moduna girer
2. Degisiklikler grid icinde tutulur (`modifiedRows` / `pendingNewRows`)
3. Toolbar'da Kaydet ve Iptal butonlari gorunur
4. **Kaydet**: Mevcut satir degisiklikleri `onCellValueChange` ile, yeni satirlar `onNewRowSave` ile commit edilir
5. **Iptal**: Tum degisiklikler dahili olarak geri alinir, tuketici hicbir sey yapmaz

### Yeni Satir Ekleme

`createEmptyRow` fonksiyonu verildiginde toolbar'da "+" butonu gorunur:

```tsx
<Grid
  createEmptyRow={() => ({ id: crypto.randomUUID(), name: '', price: 0 })}
  onNewRowSave={(newRows) => setProducts(prev => [...prev, ...newRows])}
/>
```

- Yeni satirlar `pendingNewRows` listesinde tutulur (parent data'ya eklenmez)
- Kaydet: `onNewRowSave` ile commit edilir
- Iptal: pendingNewRows temizlenir, satir kaybolur

### Mevcut Satir Duzenleme

Hucre duzenlendikten sonra degisiklik `modifiedRows` map'inde tutulur:

- Kaydet: `onCellValueChange` ile her degisen hucre commit edilir
- Iptal: `modifiedRows` temizlenir, hucreler orijinal degerlere doner
- Tuketici cancel icin **hicbir kod yazmaz**

### Hesaplanan Alanlar (Recalculation)

`onPendingCellChange` callback'i hem yeni hem mevcut satirlarda recalculation icin kullanilir:

```tsx
<Grid
  onPendingCellChange={(row, columnId, newValue) => {
    const updated = { ...row, [columnId]: newValue };
    if (['qty', 'price'].includes(columnId)) {
      updated.total = updated.qty * updated.price;
    }
    return updated;
  }}
/>
```

### Klavye Navigasyonu

| Tus | Davranis |
|-----|----------|
| `Tab` | Mevcut hucreyi kaydeder, sonraki editable hucreye gecer. |
| `Enter` | `Tab` ile ayni davranis. |
| `Escape` | Hucre editorunu kapatir (degisiklik pending kalir). |

### Programatik Satir Ekleme (GridRef)

```tsx
const gridRef = useRef<GridRef>(null);
gridRef.current?.addRow(); // createEmptyRow gerektirir
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
| `onCellValueChange` | `(row, columnId, newValue, oldValue) => void` | - | Kaydet'te hucre degeri commit edilir |
| `createEmptyRow` | `() => TData` | - | Yeni satir factory fonksiyonu |
| `onNewRowSave` | `(rows: TData[]) => void` | - | Kaydet'te yeni satirlar commit edilir |
| `onPendingCellChange` | `(row, columnId, newValue) => TData` | - | Hesaplanan alan guncelleme (recalc) |
| `onEditSave` | `() => void` | - | Kaydet tamamlandiginda bildirim |
| `onEditCancel` | `() => void` | - | Iptal tamamlandiginda bildirim |

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
