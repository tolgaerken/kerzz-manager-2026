export interface InflationRateItem {
  _id: string;
  id: string;
  country: string;
  year: number;
  month: number;
  date: string;
  consumer: number;
  producer: number;
  average: number;
  monthlyConsumer: number;
  monthlyProducer: number;
  monthlyAverage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InflationRateQueryParams {
  search?: string;
  country?: string;
  year?: number;
  month?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface InflationRatesResponse {
  data: InflationRateItem[];
  total: number;
}

export interface InflationRateFormData {
  country: string;
  year: number;
  month: number;
  date: string;
  consumer: number;
  producer: number;
  monthlyConsumer: number;
  monthlyProducer: number;
}
