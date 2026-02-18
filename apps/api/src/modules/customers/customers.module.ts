import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CustomersController } from "./customers.controller";
import { CustomersService } from "./customers.service";
import { Customer, CustomerSchema } from "./schemas/customer.schema";
import { Contract, ContractSchema } from "../contracts/schemas/contract.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Customer.name, schema: CustomerSchema },
        { name: Contract.name, schema: ContractSchema }
      ],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService]
})
export class CustomersModule {}
