import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ManagerLogController } from "./manager-log.controller";
import { ManagerLogService } from "./manager-log.service";
import { ManagerLog, ManagerLogSchema } from "./schemas/manager-log.schema";
import { ManagerNotificationModule } from "../manager-notification/manager-notification.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ManagerLog.name, schema: ManagerLogSchema }]),
    forwardRef(() => ManagerNotificationModule),
  ],
  controllers: [ManagerLogController],
  providers: [ManagerLogService],
  exports: [ManagerLogService],
})
export class ManagerLogModule {}
