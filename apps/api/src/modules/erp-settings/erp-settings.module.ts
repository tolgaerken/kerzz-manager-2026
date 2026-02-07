import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ErpSettingsController } from "./erp-settings.controller";
import { ErpSettingsService } from "./erp-settings.service";
import { ErpSetting, ErpSettingSchema } from "./schemas/erp-setting.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ErpSetting.name, schema: ErpSettingSchema }],
      CONTRACT_DB_CONNECTION,
    ),
  ],
  controllers: [ErpSettingsController],
  providers: [ErpSettingsService],
  exports: [ErpSettingsService],
})
export class ErpSettingsModule {}
