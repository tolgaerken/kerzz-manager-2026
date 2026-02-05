import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LicensesController } from "./licenses.controller";
import { LicensesService } from "./licenses.service";
import { License, LicenseSchema } from "./schemas/license.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { ContractsModule } from "../contracts/contracts.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: License.name, schema: LicenseSchema }],
      CONTRACT_DB_CONNECTION
    ),
    ContractsModule
  ],
  controllers: [LicensesController],
  providers: [LicensesService],
  exports: [LicensesService]
})
export class LicensesModule {}
