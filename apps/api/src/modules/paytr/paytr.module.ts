import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PaytrService } from "./paytr.service";
import {
  VirtualPosConfig,
  VirtualPosConfigSchema,
} from "./schemas/virtual-pos-config.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: VirtualPosConfig.name, schema: VirtualPosConfigSchema }],
      CONTRACT_DB_CONNECTION
    ),
  ],
  providers: [PaytrService],
  exports: [PaytrService],
})
export class PaytrModule {}
