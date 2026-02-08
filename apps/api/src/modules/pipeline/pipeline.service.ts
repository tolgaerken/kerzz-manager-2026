import { Injectable } from "@nestjs/common";
import { PipelineProductsService } from "../pipeline-items/pipeline-products/pipeline-products.service";
import { PipelineLicensesService } from "../pipeline-items/pipeline-licenses/pipeline-licenses.service";
import { PipelineRentalsService } from "../pipeline-items/pipeline-rentals/pipeline-rentals.service";
import { PipelinePaymentsService } from "../pipeline-items/pipeline-payments/pipeline-payments.service";

@Injectable()
export class PipelineService {
  constructor(
    private productsService: PipelineProductsService,
    private licensesService: PipelineLicensesService,
    private rentalsService: PipelineRentalsService,
    private paymentsService: PipelinePaymentsService
  ) {}

  /**
   * Dönüşüm sırasında tüm alt koleksiyonları kaynaktan hedefe klonlar.
   */
  async cloneAllItems(
    sourceParentId: string,
    sourceType: string,
    targetParentId: string,
    targetType: string,
    pipelineRef?: string
  ) {
    const [products, licenses, rentals, payments] = await Promise.all([
      this.productsService.cloneForParent(
        sourceParentId,
        sourceType,
        targetParentId,
        targetType,
        pipelineRef
      ),
      this.licensesService.cloneForParent(
        sourceParentId,
        sourceType,
        targetParentId,
        targetType,
        pipelineRef
      ),
      this.rentalsService.cloneForParent(
        sourceParentId,
        sourceType,
        targetParentId,
        targetType,
        pipelineRef
      ),
      this.paymentsService.cloneForParent(
        sourceParentId,
        sourceType,
        targetParentId,
        targetType,
        pipelineRef
      ),
    ]);

    return { products, licenses, rentals, payments };
  }

  /**
   * Parent silindiğinde tüm alt koleksiyon kayıtlarını siler.
   */
  async deleteAllItems(parentId: string, parentType: string) {
    const [products, licenses, rentals, payments] = await Promise.all([
      this.productsService.deleteByParent(parentId, parentType),
      this.licensesService.deleteByParent(parentId, parentType),
      this.rentalsService.deleteByParent(parentId, parentType),
      this.paymentsService.deleteByParent(parentId, parentType),
    ]);

    return {
      deletedProducts: products,
      deletedLicenses: licenses,
      deletedRentals: rentals,
      deletedPayments: payments,
    };
  }

  /**
   * Bir parent'a ait tüm alt koleksiyon kayıtlarını getirir.
   */
  async getAllItems(parentId: string, parentType: string) {
    const [products, licenses, rentals, payments] = await Promise.all([
      this.productsService.findByParent(parentId, parentType),
      this.licensesService.findByParent(parentId, parentType),
      this.rentalsService.findByParent(parentId, parentType),
      this.paymentsService.findByParent(parentId, parentType),
    ]);

    return { products, licenses, rentals, payments };
  }

  /**
   * Dual write: body'de gelen array'leri ilgili koleksiyonlara yazar.
   */
  async syncItems(
    parentId: string,
    parentType: string,
    pipelineRef: string,
    data: {
      products?: any[];
      licenses?: any[];
      rentals?: any[];
      payments?: any[];
    }
  ) {
    const results: any = {};

    if (data.products !== undefined) {
      results.products = await this.productsService.batchUpsert(
        parentId,
        parentType,
        pipelineRef,
        data.products
      );
    }

    if (data.licenses !== undefined) {
      results.licenses = await this.licensesService.batchUpsert(
        parentId,
        parentType,
        pipelineRef,
        data.licenses
      );
    }

    if (data.rentals !== undefined) {
      results.rentals = await this.rentalsService.batchUpsert(
        parentId,
        parentType,
        pipelineRef,
        data.rentals
      );
    }

    if (data.payments !== undefined) {
      results.payments = await this.paymentsService.batchUpsert(
        parentId,
        parentType,
        pipelineRef,
        data.payments
      );
    }

    return results;
  }
}
