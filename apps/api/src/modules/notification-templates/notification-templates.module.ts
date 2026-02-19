import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationTemplatesController } from "./notification-templates.controller";
import { NotificationTemplatesService } from "./notification-templates.service";
import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from "./schemas/notification-template.schema";
import { EmailModule } from "../email";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
    ]),
    EmailModule,
  ],
  controllers: [NotificationTemplatesController],
  providers: [NotificationTemplatesService],
  exports: [NotificationTemplatesService],
})
export class NotificationTemplatesModule {}
