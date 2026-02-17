import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SalesController } from "./sales.controller";
import { SalesService } from "./sales.service";
import { SaleApprovalService } from "./services/sale-approval.service";
import { SaleApprovalNotificationService } from "./services/sale-approval-notification.service";
import { Sale, SaleSchema } from "./schemas/sale.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { SSO_DB_CONNECTION } from "../../database";
import { PipelineModule } from "../pipeline";
import { OffersModule } from "../offers";
import { PipelineItemsModule } from "../pipeline-items";
import { NotificationDispatchModule } from "../notification-dispatch";
import {
  SsoUser,
  SsoUserSchema,
  SsoAppLicence,
  SsoAppLicenceSchema,
  SsoRole,
  SsoRoleSchema,
} from "../sso/schemas";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Sale.name, schema: SaleSchema }],
      CONTRACT_DB_CONNECTION
    ),
    MongooseModule.forFeature(
      [
        { name: SsoUser.name, schema: SsoUserSchema },
        { name: SsoAppLicence.name, schema: SsoAppLicenceSchema },
        { name: SsoRole.name, schema: SsoRoleSchema },
      ],
      SSO_DB_CONNECTION
    ),
    PipelineModule,
    OffersModule,
    PipelineItemsModule,
    NotificationDispatchModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, SaleApprovalService, SaleApprovalNotificationService],
  exports: [SalesService, SaleApprovalService],
})
export class SalesModule {}
