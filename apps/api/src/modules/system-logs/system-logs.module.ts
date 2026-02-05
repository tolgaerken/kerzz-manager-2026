import { Module, Global } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SystemLogsController } from "./system-logs.controller";
import { SystemLogsService } from "./system-logs.service";
import { SystemLog, SystemLogSchema } from "./schemas/system-log.schema";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemLog.name, schema: SystemLogSchema },
    ]),
  ],
  controllers: [SystemLogsController],
  providers: [SystemLogsService],
  exports: [SystemLogsService],
})
export class SystemLogsModule {}
