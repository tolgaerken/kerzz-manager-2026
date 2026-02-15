import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContractPaymentsController } from "./contract-payments.controller";
import { ContractPaymentsService } from "./contract-payments.service";
import { ContractPayment, ContractPaymentSchema } from "./schemas/contract-payment.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
// Yeni servisler
import { PaymentPlanService } from "./services/payment-plan.service";
import { InvoiceCalculatorService } from "./services/invoice-calculator.service";
import { PlanGeneratorService } from "./services/plan-generator.service";
import { ProratedPlanService } from "./services/prorated-plan.service";
// Bagimliliklardaki schema'lar (dogrudan model erisimi icin)
import { Contract, ContractSchema } from "../contracts/schemas/contract.schema";
import { Customer, CustomerSchema } from "../customers/schemas/customer.schema";
import { ContractCashRegister, ContractCashRegisterSchema } from "../contract-cash-registers/schemas/contract-cash-register.schema";
import { ContractSupport, ContractSupportSchema } from "../contract-supports/schemas/contract-support.schema";
import { ContractItem, ContractItemSchema } from "../contract-items/schemas/contract-item.schema";
import { ContractSaas, ContractSaasSchema } from "../contract-saas/schemas/contract-saas.schema";
import { ContractVersion, ContractVersionSchema } from "../contract-versions/schemas/contract-version.schema";
import { SoftwareProduct, SoftwareProductSchema } from "../software-products/schemas/software-product.schema";
// Harici moduller
import { ExchangeRateModule } from "../exchange-rate";
import { ErpSettingsModule } from "../erp-settings";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: ContractPayment.name, schema: ContractPaymentSchema },
        { name: Contract.name, schema: ContractSchema },
        { name: Customer.name, schema: CustomerSchema },
        { name: ContractCashRegister.name, schema: ContractCashRegisterSchema },
        { name: ContractSupport.name, schema: ContractSupportSchema },
        { name: ContractItem.name, schema: ContractItemSchema },
        { name: ContractSaas.name, schema: ContractSaasSchema },
        { name: ContractVersion.name, schema: ContractVersionSchema },
        { name: SoftwareProduct.name, schema: SoftwareProductSchema },
      ],
      CONTRACT_DB_CONNECTION,
    ),
    ExchangeRateModule,
    ErpSettingsModule,
  ],
  controllers: [ContractPaymentsController],
  providers: [
    ContractPaymentsService,
    PaymentPlanService,
    InvoiceCalculatorService,
    PlanGeneratorService,
    ProratedPlanService,
  ],
  exports: [ContractPaymentsService, PaymentPlanService, ProratedPlanService],
})
export class ContractPaymentsModule {}
