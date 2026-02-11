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
} from "../sso/schemas";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PermissionsGuard } from "./guards/permissions.guard";

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
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, PermissionsGuard],
  exports: [AuthService, JwtAuthGuard, PermissionsGuard]
})
export class AuthModule {}
