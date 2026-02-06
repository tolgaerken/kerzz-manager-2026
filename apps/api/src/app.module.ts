import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "./config";
import { DatabaseModule, ContractDatabaseModule } from "./database";
import { HealthModule } from "./modules/health/health.module";
import { ContractsModule } from "./modules/contracts";
import { CustomersModule } from "./modules/customers";
import { LicensesModule } from "./modules/licenses";
import { HardwareProductsModule } from "./modules/hardware-products";
import { SoftwareProductsModule } from "./modules/software-products";
import { EftPosModelsModule } from "./modules/eft-pos-models";
import { ContractUsersModule } from "./modules/contract-users";
import { ContractSupportsModule } from "./modules/contract-supports";
import { ContractSaasModule } from "./modules/contract-saas";
import { ContractCashRegistersModule } from "./modules/contract-cash-registers";
import { ContractVersionsModule } from "./modules/contract-versions";
import { ContractItemsModule } from "./modules/contract-items";
import { ContractDocumentsModule } from "./modules/contract-documents";
import { ContractPaymentsModule } from "./modules/contract-payments";
import { InvoicesModule } from "./modules/invoices";
import { PaymentsModule } from "./modules/payments";
import { LogsModule } from "./modules/logs";
import { NotificationsModule } from "./modules/notifications";
import { SystemLogsModule, AuditLogInterceptor } from "./modules/system-logs";
// Notification System Modules
import { EmailModule } from "./modules/email";
import { SmsModule } from "./modules/sms";
import { NotificationTemplatesModule } from "./modules/notification-templates";
import { NotificationDispatchModule } from "./modules/notification-dispatch";
import { NotificationSettingsModule } from "./modules/notification-settings";
import { NotificationQueueModule } from "./modules/notification-queue";
import { CronJobsModule } from "./modules/cron-jobs";
import { PaytrModule } from "./modules/paytr";
import { AutomatedPaymentsModule } from "./modules/automated-payments";

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ContractDatabaseModule,
    HealthModule,
    ContractsModule,
    CustomersModule,
    LicensesModule,
    HardwareProductsModule,
    SoftwareProductsModule,
    EftPosModelsModule,
    // Contract Detail Modules
    ContractUsersModule,
    ContractSupportsModule,
    ContractSaasModule,
    ContractCashRegistersModule,
    ContractVersionsModule,
    ContractItemsModule,
    ContractDocumentsModule,
    ContractPaymentsModule,
    // Finance Modules
    InvoicesModule,
    PaymentsModule,
    PaytrModule,
    AutomatedPaymentsModule,
    // Log & Notification Modules
    LogsModule,
    NotificationsModule,
    // System Logs Module (Global)
    SystemLogsModule,
    // Notification System Modules
    EmailModule,
    SmsModule,
    NotificationTemplatesModule,
    NotificationDispatchModule,
    NotificationSettingsModule,
    NotificationQueueModule,
    CronJobsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
