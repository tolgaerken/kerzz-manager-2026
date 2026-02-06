import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PaymentLink, PaymentLinkSchema } from "./schemas/payment-link.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { EmailModule } from "../email/email.module";
import { SmsModule } from "../sms/sms.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: PaymentLink.name, schema: PaymentLinkSchema }],
      CONTRACT_DB_CONNECTION
    ),
    EmailModule,
    SmsModule
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService]
})
export class PaymentsModule {}
