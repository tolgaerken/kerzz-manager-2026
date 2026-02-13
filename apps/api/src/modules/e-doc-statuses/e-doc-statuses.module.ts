import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { EDocStatusesController } from "./e-doc-statuses.controller";
import { EDocStatusesService } from "./e-doc-statuses.service";

@Module({
  imports: [HttpModule.register({ timeout: 30000 })],
  controllers: [EDocStatusesController],
  providers: [EDocStatusesService],
  exports: [EDocStatusesService],
})
export class EDocStatusesModule {}
