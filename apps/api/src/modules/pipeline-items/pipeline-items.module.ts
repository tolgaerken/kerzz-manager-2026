import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

// Products
import {
  PipelineProduct,
  PipelineProductSchema,
} from "./pipeline-products/schemas/pipeline-product.schema";
import { PipelineProductsController } from "./pipeline-products/pipeline-products.controller";
import { PipelineProductsService } from "./pipeline-products/pipeline-products.service";

// Licenses
import {
  PipelineLicense,
  PipelineLicenseSchema,
} from "./pipeline-licenses/schemas/pipeline-license.schema";
import { PipelineLicensesController } from "./pipeline-licenses/pipeline-licenses.controller";
import { PipelineLicensesService } from "./pipeline-licenses/pipeline-licenses.service";

// Rentals
import {
  PipelineRental,
  PipelineRentalSchema,
} from "./pipeline-rentals/schemas/pipeline-rental.schema";
import { PipelineRentalsController } from "./pipeline-rentals/pipeline-rentals.controller";
import { PipelineRentalsService } from "./pipeline-rentals/pipeline-rentals.service";

// Payments
import {
  PipelinePayment,
  PipelinePaymentSchema,
} from "./pipeline-payments/schemas/pipeline-payment.schema";
import { PipelinePaymentsController } from "./pipeline-payments/pipeline-payments.controller";
import { PipelinePaymentsService } from "./pipeline-payments/pipeline-payments.service";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: PipelineProduct.name, schema: PipelineProductSchema },
        { name: PipelineLicense.name, schema: PipelineLicenseSchema },
        { name: PipelineRental.name, schema: PipelineRentalSchema },
        { name: PipelinePayment.name, schema: PipelinePaymentSchema },
      ],
      CONTRACT_DB_CONNECTION
    ),
  ],
  controllers: [
    PipelineProductsController,
    PipelineLicensesController,
    PipelineRentalsController,
    PipelinePaymentsController,
  ],
  providers: [
    PipelineProductsService,
    PipelineLicensesService,
    PipelineRentalsService,
    PipelinePaymentsService,
  ],
  exports: [
    PipelineProductsService,
    PipelineLicensesService,
    PipelineRentalsService,
    PipelinePaymentsService,
  ],
})
export class PipelineItemsModule {}
