import { Module } from "@nestjs/common";
import { OfferDocumentController } from "./offer-document.controller";
import { OfferDocumentService } from "./offer-document.service";
import { PuppeteerService } from "./puppeteer/puppeteer.service";
import { OffersModule } from "../offers";

@Module({
  imports: [OffersModule],
  controllers: [OfferDocumentController],
  providers: [OfferDocumentService, PuppeteerService],
  exports: [OfferDocumentService],
})
export class OfferDocumentModule {}
