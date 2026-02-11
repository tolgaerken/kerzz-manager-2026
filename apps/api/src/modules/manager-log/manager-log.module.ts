import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ManagerLogController } from "./manager-log.controller";
import { ManagerLogService } from "./manager-log.service";
import { ManagerLog, ManagerLogSchema } from "./schemas/manager-log.schema";
import { ManagerNotificationModule } from "../manager-notification/manager-notification.module";
import { LegacyLog, LegacyLogSchema } from "./legacy/legacy-log.schema";
import { LegacyLogRepository } from "./legacy/legacy-log.repository";
import { CONTRACT_DB_CONNECTION } from "../../database";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ManagerLog.name, schema: ManagerLogSchema }]),
    MongooseModule.forFeature(
      [{ name: LegacyLog.name, schema: LegacyLogSchema }],
      CONTRACT_DB_CONNECTION
    ),
    forwardRef(() => ManagerNotificationModule),
  ],
  controllers: [ManagerLogController],
  providers: [ManagerLogService, LegacyLogRepository],
  exports: [ManagerLogService],
})
export class ManagerLogModule {}
