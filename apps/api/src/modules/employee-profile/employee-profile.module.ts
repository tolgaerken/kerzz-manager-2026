import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { SSO_DB_CONNECTION } from "../../database";
import { EmployeeProfileController } from "./employee-profile.controller";
import { EmployeeProfileService } from "./employee-profile.service";
import { EmployeeProfile, EmployeeProfileSchema } from "./schemas/employee-profile.schema";
import { SsoUser, SsoUserSchema, SsoUserApp, SsoUserAppSchema } from "../sso/schemas";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature(
      [
        { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
        { name: SsoUser.name, schema: SsoUserSchema },
        { name: SsoUserApp.name, schema: SsoUserAppSchema },
      ],
      SSO_DB_CONNECTION
    ),
  ],
  controllers: [EmployeeProfileController],
  providers: [EmployeeProfileService],
  exports: [EmployeeProfileService],
})
export class EmployeeProfileModule {}
