import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationDispatchService } from "./notification-dispatch.service";
import { NotificationLogController } from "./notification-log.controller";
import {
  NotificationLog,
  NotificationLogSchema,
} from "./schemas/notification-log.schema";
import { EmailModule } from "../email";
import { SmsModule } from "../sms";
import { NotificationTemplatesModule } from "../notification-templates";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationLog.name, schema: NotificationLogSchema },
    ]),
    EmailModule,
    SmsModule,
    NotificationTemplatesModule,
  ],
  controllers: [NotificationLogController],
  providers: [NotificationDispatchService],
  exports: [NotificationDispatchService],
})
export class NotificationDispatchModule {}
