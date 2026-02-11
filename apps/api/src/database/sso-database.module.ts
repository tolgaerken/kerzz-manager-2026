import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

export const SSO_DB_CONNECTION = "ssoConnection";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      connectionName: SSO_DB_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_SSO_URI") || configService.get<string>("MONGODB_URI"),
        dbName: configService.get<string>("MONGODB_SSO_DB") || "sso-db"
      })
    })
  ]
})
export class SsoDatabaseModule {}
