import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "./config";
import { DatabaseModule, ContractDatabaseModule, HelpersDatabaseModule, SsoDatabaseModule } from "./database";
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
import { ContractInvoicesModule } from "./modules/contract-invoices";
import { InvoicesModule } from "./modules/invoices";
import { PaymentsModule } from "./modules/payments";
import { ManagerLogModule } from "./modules/manager-log";
import { ManagerNotificationModule } from "./modules/manager-notification";
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
import { EDocCreditsModule } from "./modules/e-doc-credits";
import { EDocMembersModule } from "./modules/e-doc-members";
import { EInvoicePricesModule } from "./modules/e-invoice-prices";
// MongoDB WebSocket Module
import { MongoWsModule } from "./modules/mongo-ws";
// Company & ERP Modules
import { CompaniesModule } from "./modules/companies";
import { ErpModule } from "./modules/erp";
// Location Module
import { LocationsModule } from "./modules/locations";
// Utility Modules
import { ExchangeRateModule } from "./modules/exchange-rate";
import { ErpSettingsModule } from "./modules/erp-settings";
import { BankTransactionsModule } from "./modules/bank-transactions";
// Pipeline / CRM Modules
import { PipelineItemsModule } from "./modules/pipeline-items";
import { PipelineModule } from "./modules/pipeline";
import { LeadsModule } from "./modules/leads";
import { OffersModule } from "./modules/offers";
import { SalesModule } from "./modules/sales";
import { PipelineGatewayModule } from "./modules/pipeline-gateway";
import { OfferDocumentModule } from "./modules/offer-document";
import { VersionModule } from "./modules/version";
// Auth Module
import { AuthModule, JwtAuthGuard } from "./modules/auth";
// SSO Module
import { SsoModule } from "./modules/sso";

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ContractDatabaseModule,
    HelpersDatabaseModule,
    SsoDatabaseModule,
    // Auth Module
    AuthModule,
    // SSO Module
    SsoModule,
    HealthModule,
    VersionModule,
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
    ContractInvoicesModule,
    // Finance Modules
    InvoicesModule,
    PaymentsModule,
    PaytrModule,
    AutomatedPaymentsModule,
    // E-Document Modules
    EDocCreditsModule,
    EDocMembersModule,
    EInvoicePricesModule,
    // MongoDB WebSocket Module (Global)
    MongoWsModule,
    // Manager Log & Notification Modules
    ManagerLogModule,
    ManagerNotificationModule,
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
    // Company & ERP Modules
    CompaniesModule,
    ErpModule,
    // Bank Integration Module
    BankTransactionsModule,
    // Location Module
    LocationsModule,
    // Utility Modules
    ExchangeRateModule,
    ErpSettingsModule,
    // Pipeline / CRM Modules
    PipelineItemsModule,
    PipelineModule,
    LeadsModule,
    OffersModule,
    SalesModule,
    PipelineGatewayModule,
    // Document Generation
    OfferDocumentModule,
  ],
  providers: [
    // Global JWT Auth Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
