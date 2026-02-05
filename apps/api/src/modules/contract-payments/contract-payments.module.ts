import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContractPaymentsController } from "./contract-payments.controller";
import { ContractPaymentsService } from "./contract-payments.service";
import { ContractPayment, ContractPaymentSchema } from "./schemas/contract-payment.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ContractPayment.name, schema: ContractPaymentSchema }],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [ContractPaymentsController],
  providers: [ContractPaymentsService],
  exports: [ContractPaymentsService]
})
export class ContractPaymentsModule {}
