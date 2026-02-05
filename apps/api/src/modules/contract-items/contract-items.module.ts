import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContractItemsController } from "./contract-items.controller";
import { ContractItemsService } from "./contract-items.service";
import { ContractItem, ContractItemSchema } from "./schemas/contract-item.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ContractItem.name, schema: ContractItemSchema }],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [ContractItemsController],
  providers: [ContractItemsService],
  exports: [ContractItemsService]
})
export class ContractItemsModule {}
