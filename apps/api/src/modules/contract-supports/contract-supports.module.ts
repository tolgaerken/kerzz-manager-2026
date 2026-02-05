import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContractSupportsController } from "./contract-supports.controller";
import { ContractSupportsService } from "./contract-supports.service";
import { ContractSupport, ContractSupportSchema } from "./schemas/contract-support.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ContractSupport.name, schema: ContractSupportSchema }],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [ContractSupportsController],
  providers: [ContractSupportsService],
  exports: [ContractSupportsService]
})
export class ContractSupportsModule {}
