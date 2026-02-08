import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { Counter, CounterSchema } from "./schemas/counter.schema";
import { PipelineCounterService } from "./pipeline-counter.service";
import { PipelineCalculatorService } from "./pipeline-calculator.service";
import { PipelineService } from "./pipeline.service";
import { PipelineItemsModule } from "../pipeline-items";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Counter.name, schema: CounterSchema }],
      CONTRACT_DB_CONNECTION
    ),
    PipelineItemsModule,
  ],
  providers: [
    PipelineCounterService,
    PipelineCalculatorService,
    PipelineService,
  ],
  exports: [
    PipelineCounterService,
    PipelineCalculatorService,
    PipelineService,
  ],
})
export class PipelineModule {}
