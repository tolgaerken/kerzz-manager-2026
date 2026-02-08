import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LeadsController } from "./leads.controller";
import { LeadsService } from "./leads.service";
import { Lead, LeadSchema } from "./schemas/lead.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { PipelineModule } from "../pipeline";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Lead.name, schema: LeadSchema }],
      CONTRACT_DB_CONNECTION
    ),
    PipelineModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
