import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { SSO_DB_CONNECTION, CONTRACT_DB_CONNECTION } from "../../database";
import {
  SsoUser,
  SsoUserSchema,
  SsoUserApp,
  SsoUserAppSchema,
  SsoRole,
  SsoRoleSchema,
  SsoPermission,
  SsoPermissionSchema,
  SsoRolePermission,
  SsoRolePermissionSchema,
  SsoAppLicence,
  SsoAppLicenceSchema,
  SsoApplication,
  SsoApplicationSchema,
  SsoApiKey,
  SsoApiKeySchema,
  SsoLicense,
  SsoLicenseSchema
} from "./schemas";
import { SsoController } from "./sso.controller";
import { SsoUsersService } from "./sso-users.service";
import { SsoRolesService } from "./sso-roles.service";
import { SsoPermissionsService } from "./sso-permissions.service";
import { SsoApplicationsService } from "./sso-applications.service";
import { SsoApiKeysService } from "./sso-api-keys.service";
import { SsoAppLicensesService } from "./sso-app-licenses.service";
import { SsoUserAppsService } from "./sso-user-apps.service";
import { SsoLicensesService } from "./sso-licenses.service";

@Module({
  imports: [
    ConfigModule,
    // SSO Database schemas
    MongooseModule.forFeature(
      [
        { name: SsoUser.name, schema: SsoUserSchema },
        { name: SsoUserApp.name, schema: SsoUserAppSchema },
        { name: SsoRole.name, schema: SsoRoleSchema },
        { name: SsoPermission.name, schema: SsoPermissionSchema },
        { name: SsoRolePermission.name, schema: SsoRolePermissionSchema },
        { name: SsoAppLicence.name, schema: SsoAppLicenceSchema },
        { name: SsoApplication.name, schema: SsoApplicationSchema },
        { name: SsoApiKey.name, schema: SsoApiKeySchema }
      ],
      SSO_DB_CONNECTION
    ),
    // Contract Database schemas (for licenses)
    MongooseModule.forFeature(
      [{ name: SsoLicense.name, schema: SsoLicenseSchema }],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [SsoController],
  providers: [
    SsoUsersService,
    SsoRolesService,
    SsoPermissionsService,
    SsoApplicationsService,
    SsoApiKeysService,
    SsoAppLicensesService,
    SsoUserAppsService,
    SsoLicensesService
  ],
  exports: [
    SsoUsersService,
    SsoRolesService,
    SsoPermissionsService,
    SsoApplicationsService,
    SsoApiKeysService,
    SsoAppLicensesService,
    SsoUserAppsService,
    SsoLicensesService
  ]
})
export class SsoModule {}
