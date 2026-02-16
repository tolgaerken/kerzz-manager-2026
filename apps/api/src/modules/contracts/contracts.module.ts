import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContractsController } from "./contracts.controller";
import { ContractsService } from "./contracts.service";
import { Contract, ContractSchema } from "./schemas/contract.schema";
import {
  Customer,
  CustomerSchema
} from "../customers/schemas/customer.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Contract.name, schema: ContractSchema },
        { name: Customer.name, schema: CustomerSchema }
      ],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService]
})
export class ContractsModule {}
