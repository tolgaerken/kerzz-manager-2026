import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PaymentLink, PaymentLinkSchema } from "./schemas/payment-link.schema";
import {
  PaymentUserToken,
  PaymentUserTokenSchema,
} from "../automated-payments/schemas/payment-user-token.schema";
import {
  ContractPayment,
  ContractPaymentSchema,
} from "../contract-payments/schemas/contract-payment.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { EmailModule } from "../email/email.module";
import { SmsModule } from "../sms/sms.module";
import { PaytrModule } from "../paytr";
import { SystemLogsModule } from "../system-logs/system-logs.module";
import { NotificationSettingsModule } from "../notification-settings/notification-settings.module";
import { ManagerLogModule } from "../manager-log/manager-log.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: PaymentLink.name, schema: PaymentLinkSchema },
        { name: PaymentUserToken.name, schema: PaymentUserTokenSchema },
        { name: ContractPayment.name, schema: ContractPaymentSchema },
      ],
      CONTRACT_DB_CONNECTION
    ),
    EmailModule,
    SmsModule,
    PaytrModule,
    SystemLogsModule,
    NotificationSettingsModule,
    ManagerLogModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
