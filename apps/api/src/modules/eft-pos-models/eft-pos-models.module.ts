import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EftPosModelsController } from "./eft-pos-models.controller";
import { EftPosModelsService } from "./eft-pos-models.service";
import { EftPosModel, EftPosModelSchema } from "./schemas/eft-pos-model.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: EftPosModel.name, schema: EftPosModelSchema }],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [EftPosModelsController],
  providers: [EftPosModelsService],
  exports: [EftPosModelsService]
})
export class EftPosModelsModule {}
