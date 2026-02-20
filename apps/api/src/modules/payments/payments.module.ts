import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PaymentStatusChangeHandler } from "./payment-status-change.handler";
import { ContractPaymentDetailService } from "./contract-payment-detail.service";
import { PaymentLink, PaymentLinkSchema } from "./schemas/payment-link.schema";
import {
  PaymentUserToken,
  PaymentUserTokenSchema,
} from "../automated-payments/schemas/payment-user-token.schema";
import {
  ContractPayment,
  ContractPaymentSchema,
} from "../contract-payments/schemas/contract-payment.schema";
import { Contract, ContractSchema } from "../contracts/schemas/contract.schema";
import {
  ContractCashRegister,
  ContractCashRegisterSchema,
} from "../contract-cash-registers/schemas/contract-cash-register.schema";
import {
  ContractSupport,
  ContractSupportSchema,
} from "../contract-supports/schemas/contract-support.schema";
import {
  ContractItem,
  ContractItemSchema,
} from "../contract-items/schemas/contract-item.schema";
import {
  ContractSaas,
  ContractSaasSchema,
} from "../contract-saas/schemas/contract-saas.schema";
import {
  ContractVersion,
  ContractVersionSchema,
} from "../contract-versions/schemas/contract-version.schema";
import {
  InflationRate,
  InflationRateSchema,
} from "../inflation-rates/schemas/inflation-rate.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { HELPERS_DB_CONNECTION } from "../../database/helpers-database.module";
import { EmailModule } from "../email/email.module";
import { SmsModule } from "../sms/sms.module";
import { PaytrModule } from "../paytr";
import { SystemLogsModule } from "../system-logs/system-logs.module";
import { NotificationSettingsModule } from "../notification-settings/notification-settings.module";
import { ManagerLogModule } from "../manager-log/manager-log.module";
import { MongoWsModule } from "../mongo-ws/mongo-ws.module";
import { ExchangeRateModule } from "../exchange-rate";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: PaymentLink.name, schema: PaymentLinkSchema },
        { name: PaymentUserToken.name, schema: PaymentUserTokenSchema },
        { name: ContractPayment.name, schema: ContractPaymentSchema },
        { name: Contract.name, schema: ContractSchema },
        { name: ContractCashRegister.name, schema: ContractCashRegisterSchema },
        { name: ContractSupport.name, schema: ContractSupportSchema },
        { name: ContractItem.name, schema: ContractItemSchema },
        { name: ContractSaas.name, schema: ContractSaasSchema },
        { name: ContractVersion.name, schema: ContractVersionSchema },
      ],
      CONTRACT_DB_CONNECTION
    ),
    MongooseModule.forFeature(
      [{ name: InflationRate.name, schema: InflationRateSchema }],
      HELPERS_DB_CONNECTION
    ),
    EmailModule,
    SmsModule,
    PaytrModule,
    SystemLogsModule,
    NotificationSettingsModule,
    ManagerLogModule,
    MongoWsModule,
    ExchangeRateModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentStatusChangeHandler, ContractPaymentDetailService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
