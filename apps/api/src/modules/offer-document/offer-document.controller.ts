import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { OfferDocumentService } from "./offer-document.service";

@Controller("offers")
export class OfferDocumentController {
  constructor(private readonly documentService: OfferDocumentService) {}

  /**
   * GET /offers/:id/document?format=html|pdf
   *
   * format=html -> text/html döner (tarayıcıda görüntüleme)
   * format=pdf  -> application/pdf döner (indirme/görüntüleme)
   */
  @Get(":id/document")
  async getDocument(
    @Param("id") id: string,
    @Query("format") format: string = "html",
    @Res() res: Response,
  ): Promise<void> {
    if (format === "pdf") {
      const pdfBuffer = await this.documentService.generatePdf(id);

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="teklif-${id}.pdf"`,
        "Content-Length": pdfBuffer.length,
      });

      res.status(HttpStatus.OK).end(pdfBuffer);
      return;
    }

    // Default: HTML
    const html = await this.documentService.generateHtml(id);

    res.set({
      "Content-Type": "text/html; charset=utf-8",
    });

    res.status(HttpStatus.OK).send(html);
  }
}
