import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import * as Handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import { OffersService } from "../offers/offers.service";
import { PuppeteerService } from "./puppeteer/puppeteer.service";
import { registerHandlebarsHelpers } from "./helpers/handlebars-helpers";

interface ItemTotals {
  currency: string;
  totalBeforeDiscount: number;
  totalDiscount: number;
  totalGrand: number;
}

@Injectable()
export class OfferDocumentService {
  private readonly logger = new Logger(OfferDocumentService.name);
  private template: Handlebars.TemplateDelegate | null = null;

  constructor(
    private readonly offersService: OffersService,
    private readonly puppeteerService: PuppeteerService,
  ) {
    registerHandlebarsHelpers();
  }

  /**
   * Template dosyasının yolunu bulur.
   * ts-node-dev (src/) ve tsc build (dist/) durumları için ayrı kontrol yapar.
   */
  private resolveTemplatePath(): string {
    // __dirname: development'da src/modules/offer-document, prod'da dist/modules/offer-document
    const candidates = [
      path.join(__dirname, "templates", "offer-document.hbs"),
      path.resolve(__dirname, "../../../src/modules/offer-document/templates/offer-document.hbs"),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return candidate;
    }

    throw new Error(
      `Offer document template bulunamadı. Aranan: ${candidates.join(", ")}`,
    );
  }

  /**
   * Handlebars template'i lazy-load ile derler.
   */
  private getTemplate(): Handlebars.TemplateDelegate {
    if (this.template) return this.template;

    const templatePath = this.resolveTemplatePath();
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    this.template = Handlebars.compile(templateSource);

    this.logger.log(`Offer document template derlendi: ${templatePath}`);
    return this.template;
  }

  /**
   * Bir item grubunun toplamlarını hesaplar.
   */
  private calculateItemTotals(items: any[]): ItemTotals {
    if (!items || items.length === 0) {
      return { currency: "usd", totalBeforeDiscount: 0, totalDiscount: 0, totalGrand: 0 };
    }

    const currency = items[0]?.currency || "usd";

    let totalBeforeDiscount = 0;
    let totalDiscount = 0;
    let totalGrand = 0;

    for (const item of items) {
      const qty = Number(item.qty) || 1;
      const price = Number(item.price) || 0;
      const discount = Number(item.discountTotal) || 0;
      const grand = Number(item.grandTotal) || 0;

      totalBeforeDiscount += qty * price;
      totalDiscount += discount;
      totalGrand += grand;
    }

    return { currency, totalBeforeDiscount, totalDiscount, totalGrand };
  }

  /**
   * Teklif verisinden Handlebars context'i oluşturur.
   */
  private buildTemplateContext(offer: any): Record<string, unknown> {
    const productTotals = this.calculateItemTotals(offer.products || []);
    const licenseTotals = this.calculateItemTotals(offer.licenses || []);
    const rentalTotals = this.calculateItemTotals(offer.rentals || []);

    return {
      offer,
      // Product totals
      productsCurrency: productTotals.currency,
      productsTotalBeforeDiscount: productTotals.totalBeforeDiscount,
      productsTotalDiscount: productTotals.totalDiscount,
      productsTotalGrand: productTotals.totalGrand,
      // License totals
      licensesCurrency: licenseTotals.currency,
      licensesTotalBeforeDiscount: licenseTotals.totalBeforeDiscount,
      licensesTotalDiscount: licenseTotals.totalDiscount,
      licensesTotalGrand: licenseTotals.totalGrand,
      // Rental totals
      rentalsCurrency: rentalTotals.currency,
      rentalsTotalBeforeDiscount: rentalTotals.totalBeforeDiscount,
      rentalsTotalDiscount: rentalTotals.totalDiscount,
      rentalsTotalGrand: rentalTotals.totalGrand,
    };
  }

  /**
   * Teklif ID'sinden HTML belge oluşturur.
   */
  async generateHtml(offerId: string): Promise<string> {
    const offer = await this.offersService.findOne(offerId);
    if (!offer) {
      throw new NotFoundException(`Teklif bulunamadı: ${offerId}`);
    }

    const template = this.getTemplate();
    const context = this.buildTemplateContext(offer);

    return template(context);
  }

  /**
   * Teklif ID'sinden PDF buffer oluşturur.
   */
  async generatePdf(offerId: string): Promise<Buffer> {
    const html = await this.generateHtml(offerId);
    return this.puppeteerService.htmlToPdf(html);
  }
}
