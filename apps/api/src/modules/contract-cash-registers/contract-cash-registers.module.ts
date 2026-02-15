import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContractCashRegistersController } from "./contract-cash-registers.controller";
import { ContractCashRegistersService } from "./contract-cash-registers.service";
import { ContractCashRegister, ContractCashRegisterSchema } from "./schemas/contract-cash-register.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { ContractPaymentsModule } from "../contract-payments";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ContractCashRegister.name, schema: ContractCashRegisterSchema }],
      CONTRACT_DB_CONNECTION
    ),
    forwardRef(() => ContractPaymentsModule),
  ],
  controllers: [ContractCashRegistersController],
  providers: [ContractCashRegistersService],
  exports: [ContractCashRegistersService]
})
export class ContractCashRegistersModule {}
