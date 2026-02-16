import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ _id: false })
export class OfferConversionInfo {
  @Prop({ type: String, default: "" })
  saleId: string;

  @Prop({ type: Boolean, default: false })
  converted: boolean;

  @Prop({ type: String, default: "" })
  convertedBy: string;

  @Prop({ type: String, default: "" })
  convertedByName: string;

  @Prop({ type: Date })
  convertedAt: Date;
}

@Schema({ _id: false })
export class OfferLossInfo {
  @Prop({ type: String, default: "" })
  reason: string; // price, competitor, timing, no-budget, no-response, other

  @Prop({ type: String, default: "" })
  competitor?: string;

  @Prop({ type: String, default: "" })
  notes?: string;

  @Prop({ type: Date })
  lostAt?: Date;

  @Prop({ type: String, default: "" })
  lostBy?: string;
}

@Schema({ _id: false })
export class OfferStageHistory {
  @Prop({ type: String, default: "" })
  fromStatus: string;

  @Prop({ type: String, default: "" })
  toStatus: string;

  @Prop({ type: String, default: "" })
  changedBy: string;

  @Prop({ type: Date, default: () => new Date() })
  changedAt: Date;

  @Prop({ type: Number, default: 0 })
  durationInStage: number;
}

@Schema({ _id: false })
export class OfferMailRecipient {
  @Prop({ type: String, default: "" })
  email: string;

  @Prop({ type: String, default: "" })
  name: string;
}

import type { AuditFields } from "../../../common/audit";

export type OfferDocument = Offer & Document & AuditFields;

@Schema({ collection: "sale-offers", timestamps: true })
export class Offer {
  _id: Types.ObjectId;

  @Prop({ type: String, default: "" })
  id: string;

  @Prop({ type: Number, index: true, unique: true })
  no: number;

  @Prop({ type: String })
  pipelineRef: string;

  @Prop({ type: String, default: "" })
  leadId: string;

  @Prop({ type: String, required: true })
  customerId: string;

  @Prop({ type: String, default: "" })
  customerName: string;

  @Prop({ type: Date, default: () => new Date() })
  saleDate: Date;

  @Prop({ type: Date })
  validUntil: Date;

  @Prop({ type: String, default: "" })
  sellerId: string;

  @Prop({ type: String, default: "" })
  sellerName: string;

  // Toplamlar (backend hesaplar)
  @Prop({ type: Object, default: {} })
  totals: Record<string, any>;

  @Prop({ type: Number, default: 0 })
  usdRate: number;

  @Prop({ type: Number, default: 0 })
  eurRate: number;

  @Prop({
    type: String,
    default: "draft",
    enum: [
      "draft",
      "sent",
      "revised",
      "waiting",
      "approved",
      "rejected",
      "won",
      "lost",
      "converted",
    ],
  })
  status: string;

  @Prop({ type: OfferConversionInfo, default: () => ({}) })
  conversionInfo: OfferConversionInfo;

  @Prop({ type: OfferLossInfo, default: () => ({}) })
  lossInfo: OfferLossInfo;

  @Prop({ type: [OfferStageHistory], default: [] })
  stageHistory: OfferStageHistory[];

  @Prop({ type: String, default: "" })
  offerNote: string;

  @Prop({ type: [OfferMailRecipient], default: [] })
  mailList: OfferMailRecipient[];

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ type: String, default: "" })
  internalFirm: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

OfferSchema.index({ pipelineRef: 1 });
OfferSchema.index({ customerId: 1 });
OfferSchema.index({ status: 1 });
OfferSchema.index({ leadId: 1 });
