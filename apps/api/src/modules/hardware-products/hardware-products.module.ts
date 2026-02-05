import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HardwareProductsController } from "./hardware-products.controller";
import { HardwareProductsService } from "./hardware-products.service";
import { HardwareProduct, HardwareProductSchema } from "./schemas/hardware-product.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: HardwareProduct.name, schema: HardwareProductSchema }],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [HardwareProductsController],
  providers: [HardwareProductsService],
  exports: [HardwareProductsService]
})
export class HardwareProductsModule {}
