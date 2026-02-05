import { Module } from "@nestjs/common";
import { ConfigModule } from "./config";
import { DatabaseModule, ContractDatabaseModule } from "./database";
import { HealthModule } from "./modules/health/health.module";
import { ContractsModule } from "./modules/contracts";
import { CustomersModule } from "./modules/customers";
import { LicensesModule } from "./modules/licenses";
import { HardwareProductsModule } from "./modules/hardware-products";
import { SoftwareProductsModule } from "./modules/software-products";
import { ContractUsersModule } from "./modules/contract-users";
import { ContractSupportsModule } from "./modules/contract-supports";
import { ContractSaasModule } from "./modules/contract-saas";
import { ContractCashRegistersModule } from "./modules/contract-cash-registers";
import { ContractVersionsModule } from "./modules/contract-versions";
import { ContractItemsModule } from "./modules/contract-items";
import { ContractDocumentsModule } from "./modules/contract-documents";
import { ContractPaymentsModule } from "./modules/contract-payments";

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
    // Contract Detail Modules
    ContractUsersModule,
    ContractSupportsModule,
    ContractSaasModule,
    ContractCashRegistersModule,
    ContractVersionsModule,
    ContractItemsModule,
    ContractDocumentsModule,
    ContractPaymentsModule
  ]
})
export class AppModule {}
