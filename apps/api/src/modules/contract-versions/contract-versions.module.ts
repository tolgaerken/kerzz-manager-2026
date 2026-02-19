import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContractVersionsController } from "./contract-versions.controller";
import { ContractVersionsService } from "./contract-versions.service";
import { ContractVersion, ContractVersionSchema } from "./schemas/contract-version.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { ContractPaymentsModule } from "../contract-payments";
import { ErpSettingsModule } from "../erp-settings";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ContractVersion.name, schema: ContractVersionSchema }],
      CONTRACT_DB_CONNECTION
    ),
    forwardRef(() => ContractPaymentsModule),
    ErpSettingsModule,
  ],
  controllers: [ContractVersionsController],
  providers: [ContractVersionsService],
  exports: [ContractVersionsService]
})
export class ContractVersionsModule {}
