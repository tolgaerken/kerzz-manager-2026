import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

export const CONTRACT_DB_CONNECTION = "contractConnection";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      connectionName: CONTRACT_DB_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_CONTRACT_URI"),
        dbName: configService.get<string>("MONGODB_CONTRACT_DB")
      })
    })
  ]
})
export class ContractDatabaseModule {}
