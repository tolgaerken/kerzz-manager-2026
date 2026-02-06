import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CompaniesController } from "./companies.controller";
import { CompaniesService } from "./companies.service";
import { GroupCompany, GroupCompanySchema } from "./schemas/group-company.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: GroupCompany.name, schema: GroupCompanySchema }],
      CONTRACT_DB_CONNECTION
    ),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
