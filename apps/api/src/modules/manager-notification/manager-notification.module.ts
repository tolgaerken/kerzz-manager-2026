import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ManagerNotificationController } from "./manager-notification.controller";
import { ManagerNotificationService } from "./manager-notification.service";
import { ManagerNotification, ManagerNotificationSchema } from "./schemas/manager-notification.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManagerNotification.name, schema: ManagerNotificationSchema },
    ]),
  ],
  controllers: [ManagerNotificationController],
  providers: [ManagerNotificationService],
  exports: [ManagerNotificationService],
})
export class ManagerNotificationModule {}
