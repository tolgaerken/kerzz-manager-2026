import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { SSO_DB_CONNECTION } from "../../database";
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
  SsoAppLicenceSchema
} from "./schemas";
import { SsoController } from "./sso.controller";
import { SsoUsersService } from "./sso-users.service";
import { SsoRolesService } from "./sso-roles.service";
import { SsoPermissionsService } from "./sso-permissions.service";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature(
      [
        { name: SsoUser.name, schema: SsoUserSchema },
        { name: SsoUserApp.name, schema: SsoUserAppSchema },
        { name: SsoRole.name, schema: SsoRoleSchema },
        { name: SsoPermission.name, schema: SsoPermissionSchema },
        { name: SsoRolePermission.name, schema: SsoRolePermissionSchema },
        { name: SsoAppLicence.name, schema: SsoAppLicenceSchema }
      ],
      SSO_DB_CONNECTION
    )
  ],
  controllers: [SsoController],
  providers: [SsoUsersService, SsoRolesService, SsoPermissionsService],
  exports: [SsoUsersService, SsoRolesService, SsoPermissionsService]
})
export class SsoModule {}
