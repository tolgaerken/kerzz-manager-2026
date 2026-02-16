import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { auditPlugin } from "../common/audit";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),
        connectionFactory: (connection: Connection) => {
          // Global audit plugin'i tüm şemalara uygula
          connection.plugin(auditPlugin);
          return connection;
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
