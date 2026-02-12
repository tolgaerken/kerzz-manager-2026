import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import * as Handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import { OffersService } from "../offers/offers.service";
import { PuppeteerService } from "./puppeteer/puppeteer.service";
import { CustomersService } from "../customers/customers.service";
import { SsoUsersService } from "../sso/sso-users.service";
import { registerHandlebarsHelpers } from "./helpers/handlebars-helpers";

interface CurrencyItemTotals {
  currency: string;
  totalBeforeDiscount: number;
  totalDiscount: number;
  totalGrand: number;
}

interface SellerInfo {
  name: string;
  phone: string;
  email: string;
}

interface CustomerInfo {
  name: string;
  companyName: string;
  brandName: string;
  address: string;
  city: string;
  taxNo: string;
  taxOffice: string;
  phone: string;
  email: string;
}

@Injectable()
export class OfferDocumentService {
  private readonly logger = new Logger(OfferDocumentService.name);
  private template: Handlebars.TemplateDelegate | null = null;

  constructor(
    private readonly offersService: OffersService,
    private readonly puppeteerService: PuppeteerService,
    private readonly customersService: CustomersService,
    private readonly ssoUsersService: SsoUsersService,
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
   * Tek bir satır kalemi için toplamları hesaplar.
   */
  private calcLineItem(item: any) {
    const qty = Number(item.qty) || 1;
    const price = Number(item.price) || 0;
    const discountRate = Number(item.discountRate) || 0;

    const lineTotal = qty * price;
    const discountTotal = lineTotal * (discountRate / 100);
    const grandTotal = lineTotal - discountTotal;

    return {
      currency: (item.currency || "usd").toLowerCase(),
      totalBeforeDiscount: lineTotal,
      totalDiscount: discountTotal,
      totalGrand: grandTotal,
    };
  }

  /**
   * Bir item grubunun toplamlarını para birimi bazında hesaplar.
   * Aynı grupta birden fazla para birimi varsa her biri için ayrı toplam döner.
   */
  private calculateItemTotalsByCurrency(items: any[]): CurrencyItemTotals[] {
    if (!items || items.length === 0) {
      return [];
    }

    const currencyMap = new Map<string, CurrencyItemTotals>();

    for (const item of items) {
      // Her satır için toplamları hesapla
      const calculated = this.calcLineItem(item);
      const currency = calculated.currency;

      const existing = currencyMap.get(currency) || {
        currency,
        totalBeforeDiscount: 0,
        totalDiscount: 0,
        totalGrand: 0,
      };

      existing.totalBeforeDiscount += calculated.totalBeforeDiscount;
      existing.totalDiscount += calculated.totalDiscount;
      existing.totalGrand += calculated.totalGrand;

      currencyMap.set(currency, existing);
    }

    // TL önce, sonra USD, sonra diğerleri
    const sortOrder = ["tl", "try", "usd", "eur"];
    return Array.from(currencyMap.values()).sort((a, b) => {
      const aIdx = sortOrder.indexOf(a.currency.toLowerCase());
      const bIdx = sortOrder.indexOf(b.currency.toLowerCase());
      const aOrder = aIdx === -1 ? 999 : aIdx;
      const bOrder = bIdx === -1 ? 999 : bIdx;
      return aOrder - bOrder;
    });
  }

  /**
   * Satıcı bilgilerini SSO'dan alır.
   */
  private async getSellerInfo(sellerId: string): Promise<SellerInfo> {
    if (!sellerId) {
      return { name: "", phone: "", email: "" };
    }

    try {
      const user = await this.ssoUsersService.getUserById(sellerId);
      if (user) {
        return {
          name: user.name || "",
          phone: user.phone || "",
          email: user.email || "",
        };
      }
    } catch (error) {
      this.logger.warn(`Satıcı bilgisi alınamadı: ${sellerId}`, error);
    }

    return { name: "", phone: "", email: "" };
  }

  /**
   * Müşteri bilgilerini alır.
   */
  private async getCustomerInfo(customerId: string): Promise<CustomerInfo> {
    const emptyInfo: CustomerInfo = {
      name: "",
      companyName: "",
      brandName: "",
      address: "",
      city: "",
      taxNo: "",
      taxOffice: "",
      phone: "",
      email: "",
    };

    if (!customerId) {
      return emptyInfo;
    }

    try {
      const customer = await this.customersService.findByAnyId(customerId);
      if (customer) {
        const addr = customer.address || {};
        const fullAddress = [addr.address, addr.town, addr.city]
          .filter(Boolean)
          .join(", ");

        return {
          name: customer.name || "",
          companyName: customer.companyName || "",
          brandName: customer.companyName || customer.name || "", // brandName olarak companyName kullan
          address: fullAddress,
          city: addr.city || "",
          taxNo: customer.taxNo || "",
          taxOffice: customer.taxOffice || "",
          phone: customer.phone || "",
          email: customer.email || "",
        };
      }
    } catch (error) {
      this.logger.warn(`Müşteri bilgisi alınamadı: ${customerId}`, error);
    }

    return emptyInfo;
  }

  /**
   * Teklif verisinden Handlebars context'i oluşturur.
   */
  private async buildTemplateContext(
    offer: any,
    sellerInfo: SellerInfo,
    customerInfo: CustomerInfo,
  ): Promise<Record<string, unknown>> {
    // Para birimi bazında toplamlar
    const productsCurrencyTotals = this.calculateItemTotalsByCurrency(offer.products || []);
    const licensesCurrencyTotals = this.calculateItemTotalsByCurrency(offer.licenses || []);
    const rentalsCurrencyTotals = this.calculateItemTotalsByCurrency(offer.rentals || []);

    return {
      offer: {
        ...offer,
        brandName: customerInfo.brandName || offer.brandName || "",
      },
      // Satıcı bilgileri
      seller: sellerInfo,
      // Müşteri bilgileri
      customer: customerInfo,
      // Para birimi bazında toplamlar (çoklu para birimi desteği)
      productsCurrencyTotals,
      licensesCurrencyTotals,
      rentalsCurrencyTotals,
      // Boolean kontroller
      hasProducts: (offer.products || []).length > 0,
      hasLicenses: (offer.licenses || []).length > 0,
      hasRentals: (offer.rentals || []).length > 0,
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

    // Paralel olarak satıcı ve müşteri bilgilerini al
    const [sellerInfo, customerInfo] = await Promise.all([
      this.getSellerInfo(offer.sellerId),
      this.getCustomerInfo(offer.customerId),
    ]);

    const template = this.getTemplate();
    const context = await this.buildTemplateContext(offer, sellerInfo, customerInfo);

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
