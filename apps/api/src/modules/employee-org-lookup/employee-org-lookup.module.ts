import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SSO_DB_CONNECTION } from "../../database";
import {
  OrgDepartment,
  OrgDepartmentSchema,
  OrgTitle,
  OrgTitleSchema,
  OrgLocation,
  OrgLocationSchema,
} from "./schemas";
import { OrgDepartmentService } from "./org-department.service";
import { OrgTitleService } from "./org-title.service";
import { OrgLocationService } from "./org-location.service";
import { OrgDepartmentController } from "./org-department.controller";
import { OrgTitleController } from "./org-title.controller";
import { OrgLocationController } from "./org-location.controller";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: OrgDepartment.name, schema: OrgDepartmentSchema },
        { name: OrgTitle.name, schema: OrgTitleSchema },
        { name: OrgLocation.name, schema: OrgLocationSchema },
      ],
      SSO_DB_CONNECTION
    ),
  ],
  controllers: [OrgDepartmentController, OrgTitleController, OrgLocationController],
  providers: [OrgDepartmentService, OrgTitleService, OrgLocationService],
  exports: [OrgDepartmentService, OrgTitleService, OrgLocationService],
})
export class EmployeeOrgLookupModule {}
