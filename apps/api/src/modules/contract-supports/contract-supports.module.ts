import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContractSupportsController } from "./contract-supports.controller";
import { ContractSupportsService } from "./contract-supports.service";
import { ContractSupport, ContractSupportSchema } from "./schemas/contract-support.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { ContractPaymentsModule } from "../contract-payments";
import { ErpSettingsModule } from "../erp-settings";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ContractSupport.name, schema: ContractSupportSchema }],
      CONTRACT_DB_CONNECTION
    ),
    forwardRef(() => ContractPaymentsModule),
    ErpSettingsModule,
  ],
  controllers: [ContractSupportsController],
  providers: [ContractSupportsService],
  exports: [ContractSupportsService]
})
export class ContractSupportsModule {}
