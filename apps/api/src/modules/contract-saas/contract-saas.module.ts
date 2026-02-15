import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContractSaasController } from "./contract-saas.controller";
import { ContractSaasService } from "./contract-saas.service";
import { ContractSaas, ContractSaasSchema } from "./schemas/contract-saas.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { ContractPaymentsModule } from "../contract-payments";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ContractSaas.name, schema: ContractSaasSchema }],
      CONTRACT_DB_CONNECTION
    ),
    forwardRef(() => ContractPaymentsModule),
  ],
  controllers: [ContractSaasController],
  providers: [ContractSaasService],
  exports: [ContractSaasService]
})
export class ContractSaasModule {}
