import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import type { Browser } from "puppeteer";

@Injectable()
export class PuppeteerService implements OnModuleDestroy {
  private readonly logger = new Logger(PuppeteerService.name);
  private browser: Browser | null = null;

  /**
   * Lazy-init ile browser instance döndürür.
   */
  private async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    this.logger.log("Puppeteer browser başlatılıyor...");

    // Dynamic import - puppeteer ESM uyumluluğu için
    const puppeteer = await import("puppeteer");
    this.browser = await puppeteer.default.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    this.logger.log("Puppeteer browser hazır.");
    return this.browser;
  }

  /**
   * HTML string'den PDF buffer oluşturur.
   */
  async htmlToPdf(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "15mm",
          right: "15mm",
          bottom: "15mm",
          left: "15mm",
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  /**
   * Modül kapanırken browser'ı kapat.
   */
  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      this.logger.log("Puppeteer browser kapatılıyor...");
      await this.browser.close();
      this.browser = null;
    }
  }
}
