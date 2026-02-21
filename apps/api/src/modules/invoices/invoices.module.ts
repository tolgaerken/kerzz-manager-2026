import { Module, OnModuleInit } from "@nestjs/common";
import { InjectConnection, MongooseModule } from "@nestjs/mongoose";
import { HttpModule } from "@nestjs/axios";
import { Connection } from "mongoose";
import { InvoicesController } from "./invoices.controller";
import { InvoicePublicController } from "./invoice-public.controller";
import { InvoicesService } from "./invoices.service";
import { InvoiceViewCaptchaService } from "./services/invoice-view-captcha.service";
import { InvoicePdfGatewayService } from "./services/invoice-pdf-gateway.service";
import {
  Invoice,
  InvoiceSchema,
  setInvoiceConnection,
} from "./schemas/invoice.schema";
import {
  Customer,
  CustomerSchema,
} from "../customers/schemas/customer.schema";
import {
  GroupCompany,
  GroupCompanySchema,
} from "../companies/schemas/group-company.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Invoice.name, schema: InvoiceSchema },
        { name: Customer.name, schema: CustomerSchema },
        { name: GroupCompany.name, schema: GroupCompanySchema },
      ],
      CONTRACT_DB_CONNECTION
    ),
    HttpModule.register({ timeout: 30000 }),
  ],
  controllers: [InvoicesController, InvoicePublicController],
  providers: [InvoicesService, InvoiceViewCaptchaService, InvoicePdfGatewayService],
  exports: [InvoicesService],
})
export class InvoicesModule implements OnModuleInit {
  constructor(
    @InjectConnection(CONTRACT_DB_CONNECTION)
    private readonly connection: Connection
  ) {}

  onModuleInit(): void {
    // Invoice-ContractPayment sync plugin için connection'ı set et
    setInvoiceConnection(this.connection);
  }
}
