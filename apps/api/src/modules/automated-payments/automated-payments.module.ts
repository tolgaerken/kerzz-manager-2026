import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AutomatedPaymentsController } from "./automated-payments.controller";
import { AutomatedPaymentsService } from "./automated-payments.service";
import {
  PaymentUserToken,
  PaymentUserTokenSchema,
} from "./schemas/payment-user-token.schema";
import {
  PaymentLink,
  PaymentLinkSchema,
} from "../payments/schemas/payment-link.schema";
import {
  ContractPayment,
  ContractPaymentSchema,
} from "../contract-payments/schemas/contract-payment.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { PaytrModule } from "../paytr";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: PaymentUserToken.name, schema: PaymentUserTokenSchema },
        { name: PaymentLink.name, schema: PaymentLinkSchema },
        { name: ContractPayment.name, schema: ContractPaymentSchema },
      ],
      CONTRACT_DB_CONNECTION
    ),
    PaytrModule,
  ],
  controllers: [AutomatedPaymentsController],
  providers: [AutomatedPaymentsService],
  exports: [AutomatedPaymentsService],
})
export class AutomatedPaymentsModule {}
