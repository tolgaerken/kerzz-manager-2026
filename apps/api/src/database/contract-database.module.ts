import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { auditPlugin } from "../common/audit";

export const CONTRACT_DB_CONNECTION = "contractConnection";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      connectionName: CONTRACT_DB_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_CONTRACT_URI"),
        dbName: configService.get<string>("MONGODB_CONTRACT_DB"),
        connectionFactory: (connection: Connection) => {
          // Global audit plugin'i tüm şemalara uygula
          connection.plugin(auditPlugin);
          return connection;
        },
      }),
    }),
  ],
})
export class ContractDatabaseModule {}
