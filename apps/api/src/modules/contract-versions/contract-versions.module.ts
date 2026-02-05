import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContractVersionsController } from "./contract-versions.controller";
import { ContractVersionsService } from "./contract-versions.service";
import { ContractVersion, ContractVersionSchema } from "./schemas/contract-version.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ContractVersion.name, schema: ContractVersionSchema }],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [ContractVersionsController],
  providers: [ContractVersionsService],
  exports: [ContractVersionsService]
})
export class ContractVersionsModule {}
