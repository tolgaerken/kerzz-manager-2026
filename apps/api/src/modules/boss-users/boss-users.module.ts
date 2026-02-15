import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { SSO_DB_CONNECTION } from "../../database";
import {
  SsoAppLicence,
  SsoAppLicenceSchema,
  SsoUser,
  SsoUserSchema
} from "../sso/schemas";
import { SmsModule } from "../sms/sms.module";
import { EmailModule } from "../email/email.module";
import { BossUsersController } from "./boss-users.controller";
import { BossUsersService } from "./boss-users.service";
import { BossUsersNotificationService } from "./boss-users-notification.service";

@Module({
  imports: [
    ConfigModule,
    SmsModule,
    EmailModule,
    MongooseModule.forFeature(
      [
        { name: SsoAppLicence.name, schema: SsoAppLicenceSchema },
        { name: SsoUser.name, schema: SsoUserSchema }
      ],
      SSO_DB_CONNECTION
    )
  ],
  controllers: [BossUsersController],
  providers: [BossUsersService, BossUsersNotificationService],
  exports: [BossUsersService, BossUsersNotificationService]
})
export class BossUsersModule {}
