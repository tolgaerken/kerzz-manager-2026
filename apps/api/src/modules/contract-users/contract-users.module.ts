import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContractUsersController } from "./contract-users.controller";
import { ContractUsersService } from "./contract-users.service";
import { ContractUser, ContractUserSchema } from "./schemas/contract-user.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ContractUser.name, schema: ContractUserSchema }],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [ContractUsersController],
  providers: [ContractUsersService],
  exports: [ContractUsersService]
})
export class ContractUsersModule {}
