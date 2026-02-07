import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EDocMembersController } from "./e-doc-members.controller";
import { EDocMembersService } from "./e-doc-members.service";
import { MemberBalanceService } from "./services/member-balance.service";
import {
  EDocMember,
  EDocMemberSchema,
} from "./schemas/e-doc-member.schema";
import {
  EDocTransaction,
  EDocTransactionSchema,
} from "./schemas/e-doc-transaction.schema";
import {
  Customer,
  CustomerSchema,
} from "../customers/schemas/customer.schema";
import {
  License,
  LicenseSchema,
} from "../licenses/schemas/license.schema";
import { HELPERS_DB_CONNECTION } from "../../database/helpers-database.module";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: EDocMember.name, schema: EDocMemberSchema },
        { name: EDocTransaction.name, schema: EDocTransactionSchema },
      ],
      HELPERS_DB_CONNECTION,
    ),
    MongooseModule.forFeature(
      [
        { name: Customer.name, schema: CustomerSchema },
        { name: License.name, schema: LicenseSchema },
      ],
      CONTRACT_DB_CONNECTION,
    ),
  ],
  controllers: [EDocMembersController],
  providers: [EDocMembersService, MemberBalanceService],
  exports: [EDocMembersService, MemberBalanceService],
})
export class EDocMembersModule {}
