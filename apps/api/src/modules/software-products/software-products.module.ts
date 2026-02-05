import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SoftwareProductsController } from "./software-products.controller";
import { SoftwareProductsService } from "./software-products.service";
import { SoftwareProduct, SoftwareProductSchema } from "./schemas/software-product.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: SoftwareProduct.name, schema: SoftwareProductSchema }],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [SoftwareProductsController],
  providers: [SoftwareProductsService],
  exports: [SoftwareProductsService]
})
export class SoftwareProductsModule {}
