import type { GridColumnDef } from "@kerzz/grid";
import type { InflationRateItem } from "../../types";

const formatNumber = (value: number | null | undefined): string => {
  if (value == null) return "-";
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
};

export const inflationRateColumnDefs: GridColumnDef<InflationRateItem>[] = [
  {
    id: "year",
    header: "Yıl",
    accessorKey: "year",
    width: 90,
    sortable: true,
  },
  {
    id: "month",
    header: "Ay",
    accessorKey: "month",
    width: 70,
    sortable: true,
  },
  {
    id: "date",
    header: "Tarih",
    accessorKey: "date",
    width: 120,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "consumer",
    header: "Tüketici",
    accessorKey: "consumer",
    width: 120,
    sortable: true,
    cell: (value) => formatNumber(value as number),
  },
  {
    id: "producer",
    header: "Üretici",
    accessorKey: "producer",
    width: 120,
    sortable: true,
    cell: (value) => formatNumber(value as number),
  },
  {
    id: "average",
    header: "Ortalama",
    accessorKey: "average",
    width: 120,
    sortable: true,
    cell: (value) => formatNumber(value as number),
    cellClassName: "font-semibold",
  },
  {
    id: "monthlyConsumer",
    header: "Aylık Tüketici",
    accessorKey: "monthlyConsumer",
    width: 140,
    sortable: true,
    cell: (value) => formatNumber(value as number),
  },
  {
    id: "monthlyProducer",
    header: "Aylık Üretici",
    accessorKey: "monthlyProducer",
    width: 140,
    sortable: true,
    cell: (value) => formatNumber(value as number),
  },
  {
    id: "monthlyAverage",
    header: "Aylık Ortalama",
    accessorKey: "monthlyAverage",
    width: 140,
    sortable: true,
    cell: (value) => formatNumber(value as number),
    cellClassName: "font-semibold",
  },
  {
    id: "country",
    header: "Ülke",
    accessorKey: "country",
    width: 90,
    sortable: true,
    cellClassName: "uppercase",
  },
];
