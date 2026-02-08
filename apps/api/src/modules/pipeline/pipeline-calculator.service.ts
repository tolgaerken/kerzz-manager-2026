import { Injectable } from "@nestjs/common";
import { PipelineProductsService } from "../pipeline-items/pipeline-products/pipeline-products.service";
import { PipelineLicensesService } from "../pipeline-items/pipeline-licenses/pipeline-licenses.service";
import { PipelineRentalsService } from "../pipeline-items/pipeline-rentals/pipeline-rentals.service";

export interface CurrencyTotals {
  currency: string;
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

export interface PipelineTotals {
  currencies: CurrencyTotals[];
  overallSubTotal: number;
  overallDiscountTotal: number;
  overallTaxTotal: number;
  overallGrandTotal: number;
}

@Injectable()
export class PipelineCalculatorService {
  constructor(
    private productsService: PipelineProductsService,
    private licensesService: PipelineLicensesService,
    private rentalsService: PipelineRentalsService
  ) {}

  /**
   * Bir parent (offer/sale) için tüm alt koleksiyonlardan
   * toplamları hesaplar. Para birimi bazında ve genel toplamlar döner.
   */
  async calculateTotals(
    parentId: string,
    parentType: string
  ): Promise<PipelineTotals> {
    const [products, licenses, rentals] = await Promise.all([
      this.productsService.findByParent(parentId, parentType),
      this.licensesService.findByParent(parentId, parentType),
      this.rentalsService.findByParent(parentId, parentType),
    ]);

    // Tüm satır kalemlerini birleştir
    const allItems = [
      ...products.map((p) => this.calcLineItem(p)),
      ...licenses.map((l) => this.calcLineItem(l)),
      ...rentals.map((r) => this.calcRentalItem(r)),
    ];

    // Para birimi bazında grupla
    const currencyMap = new Map<string, CurrencyTotals>();

    for (const item of allItems) {
      const currency = item.currency || "tl";
      const existing = currencyMap.get(currency) || {
        currency,
        subTotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: 0,
      };

      existing.subTotal += item.subTotal;
      existing.discountTotal += item.discountTotal;
      existing.taxTotal += item.taxTotal;
      existing.grandTotal += item.grandTotal;

      currencyMap.set(currency, existing);
    }

    const currencies = Array.from(currencyMap.values());

    return {
      currencies,
      overallSubTotal: currencies.reduce((sum, c) => sum + c.subTotal, 0),
      overallDiscountTotal: currencies.reduce(
        (sum, c) => sum + c.discountTotal,
        0
      ),
      overallTaxTotal: currencies.reduce((sum, c) => sum + c.taxTotal, 0),
      overallGrandTotal: currencies.reduce(
        (sum, c) => sum + c.grandTotal,
        0
      ),
    };
  }

  private calcLineItem(item: any) {
    const qty = item.qty || 1;
    const price = item.price || 0;
    const discountRate = item.discountRate || 0;
    const vatRate = item.vatRate || 0;

    const lineTotal = qty * price;
    const discountTotal = lineTotal * (discountRate / 100);
    const subTotal = lineTotal - discountTotal;
    const taxTotal = subTotal * (vatRate / 100);
    const grandTotal = subTotal + taxTotal;

    return {
      currency: item.currency || "tl",
      subTotal,
      discountTotal,
      taxTotal,
      grandTotal,
    };
  }

  private calcRentalItem(item: any) {
    const qty = item.qty || 1;
    const price = item.price || 0;
    const discountRate = item.discountRate || 0;
    const vatRate = item.vatRate || 0;
    const rentPeriod = item.rentPeriod || 12;

    const lineTotal = qty * price * rentPeriod;
    const discountTotal = lineTotal * (discountRate / 100);
    const subTotal = lineTotal - discountTotal;
    const taxTotal = subTotal * (vatRate / 100);
    const grandTotal = subTotal + taxTotal;

    return {
      currency: item.currency || "tl",
      subTotal,
      discountTotal,
      taxTotal,
      grandTotal,
    };
  }
}
