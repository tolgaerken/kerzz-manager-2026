import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { SSO_DB_CONNECTION } from "../../database";
import { EmployeeProfileController } from "./employee-profile.controller";
import { EmployeeProfileService } from "./employee-profile.service";
import { EmployeeProfile, EmployeeProfileSchema } from "./schemas/employee-profile.schema";
import { SsoUser, SsoUserSchema, SsoUserApp, SsoUserAppSchema } from "../sso/schemas";
import {
  OrgDepartment,
  OrgDepartmentSchema,
  OrgTitle,
  OrgTitleSchema,
  OrgLocation,
  OrgLocationSchema,
} from "../employee-org-lookup/schemas";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature(
      [
        { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
        { name: SsoUser.name, schema: SsoUserSchema },
        { name: SsoUserApp.name, schema: SsoUserAppSchema },
        { name: OrgDepartment.name, schema: OrgDepartmentSchema },
        { name: OrgTitle.name, schema: OrgTitleSchema },
        { name: OrgLocation.name, schema: OrgLocationSchema },
      ],
      SSO_DB_CONNECTION
    ),
  ],
  controllers: [EmployeeProfileController],
  providers: [EmployeeProfileService],
  exports: [EmployeeProfileService],
})
export class EmployeeProfileModule {}
