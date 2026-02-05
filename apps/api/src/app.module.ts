import { Module } from "@nestjs/common";
import { ConfigModule } from "./config";
import { DatabaseModule, ContractDatabaseModule } from "./database";
import { HealthModule } from "./modules/health/health.module";
import { ContractsModule } from "./modules/contracts";
import { CustomersModule } from "./modules/customers";
import { LicensesModule } from "./modules/licenses";
import { HardwareProductsModule } from "./modules/hardware-products";
import { SoftwareProductsModule } from "./modules/software-products";

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
    SoftwareProductsModule
  ]
})
export class AppModule {}
