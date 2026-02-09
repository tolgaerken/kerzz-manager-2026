import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { Lead, LeadDocument } from "../leads/schemas/lead.schema";
import { Offer, OfferDocument } from "../offers/schemas/offer.schema";
import { Sale, SaleDocument } from "../sales/schemas/sale.schema";
import { PipelineService } from "../pipeline";
import { OffersService } from "../offers";
import { SalesService } from "../sales";
import { AuditLog } from "../system-logs";

@Controller("pipeline")
export class PipelineGatewayController {
  constructor(
    @InjectModel(Lead.name, CONTRACT_DB_CONNECTION)
    private leadModel: Model<LeadDocument>,
    @InjectModel(Offer.name, CONTRACT_DB_CONNECTION)
    private offerModel: Model<OfferDocument>,
    @InjectModel(Sale.name, CONTRACT_DB_CONNECTION)
    private saleModel: Model<SaleDocument>,
    private pipelineService: PipelineService,
    private offersService: OffersService,
    private salesService: SalesService
  ) {}

  @Get(":ref/history")
  async getHistory(@Param("ref") ref: string) {
    const [leads, offers, sales] = await Promise.all([
      this.leadModel.find({ pipelineRef: ref }).lean().exec(),
      this.offerModel.find({ pipelineRef: ref }).lean().exec(),
      this.saleModel.find({ pipelineRef: ref }).lean().exec(),
    ]);

    const offerId = offers[0]?._id?.toString();
    const saleId = sales[0]?._id?.toString();

    const [offerItems, saleItems] = await Promise.all([
      offerId
        ? this.pipelineService.getAllItems(offerId, "offer")
        : Promise.resolve(null),
      saleId
        ? this.pipelineService.getAllItems(saleId, "sale")
        : Promise.resolve(null),
    ]);

    return {
      pipelineRef: ref,
      leads,
      offers: offers.map((o) => ({
        ...o,
        ...(o._id.toString() === offerId && offerItems ? offerItems : {}),
      })),
      sales: sales.map((s) => ({
        ...s,
        ...(s._id.toString() === saleId && saleItems ? saleItems : {}),
      })),
    };
  }

  @AuditLog({ module: "pipeline", entityType: "Conversion" })
  @Post("convert/lead-to-offer/:leadId")
  async convertLeadToOffer(
    @Param("leadId") leadId: string,
    @Body() body?: any
  ) {
    return this.offersService.convertFromLead(leadId, body);
  }

  @AuditLog({ module: "pipeline", entityType: "Conversion" })
  @Post("convert/offer-to-sale/:offerId")
  async convertOfferToSale(
    @Param("offerId") offerId: string,
    @Body() body: { userId: string; userName: string }
  ) {
    return this.salesService.convertFromOffer(
      offerId,
      body.userId,
      body.userName
    );
  }

  @AuditLog({ module: "pipeline", entityType: "Conversion" })
  @Post("revert/lead-to-offer/:leadId")
  async revertLeadToOffer(@Param("leadId") leadId: string) {
    return this.offersService.revertFromLead(leadId);
  }
}
