import { Module } from "@nestjs/common";
import { OfferDocumentController } from "./offer-document.controller";
import { OfferDocumentService } from "./offer-document.service";
import { PuppeteerService } from "./puppeteer/puppeteer.service";
import { OffersModule } from "../offers";
import { CustomersModule } from "../customers/customers.module";
import { SsoModule } from "../sso/sso.module";

@Module({
  imports: [OffersModule, CustomersModule, SsoModule],
  controllers: [OfferDocumentController],
  providers: [OfferDocumentService, PuppeteerService],
  exports: [OfferDocumentService],
})
export class OfferDocumentModule {}
