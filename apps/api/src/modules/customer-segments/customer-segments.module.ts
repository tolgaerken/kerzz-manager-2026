import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CustomerSegmentsController } from "./customer-segments.controller";
import { CustomerSegmentsService } from "./customer-segments.service";
import {
  CustomerSegment,
  CustomerSegmentSchema
} from "./schemas/customer-segment.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: CustomerSegment.name, schema: CustomerSegmentSchema }],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [CustomerSegmentsController],
  providers: [CustomerSegmentsService],
  exports: [CustomerSegmentsService]
})
export class CustomerSegmentsModule {}
