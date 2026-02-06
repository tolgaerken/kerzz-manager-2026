import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationSettingsController } from "./notification-settings.controller";
import { NotificationSettingsService } from "./notification-settings.service";
import {
  NotificationSettings,
  NotificationSettingsSchema,
} from "./schemas/notification-settings.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationSettings.name, schema: NotificationSettingsSchema },
    ]),
  ],
  controllers: [NotificationSettingsController],
  providers: [NotificationSettingsService],
  exports: [NotificationSettingsService],
})
export class NotificationSettingsModule {}
