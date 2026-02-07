import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

export const HELPERS_DB_CONNECTION = "helpersConnection";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      connectionName: HELPERS_DB_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_HELPERS_URI") ||
             configService.get<string>("MONGODB_URI"),
        dbName: configService.get<string>("MONGODB_HELPERS_DB") || "helpers",
      }),
    }),
  ],
})
export class HelpersDatabaseModule {}
