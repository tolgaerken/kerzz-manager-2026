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
export class OfferMailRecipient {
  @Prop({ type: String, default: "" })
  email: string;

  @Prop({ type: String, default: "" })
  name: string;
}

export type OfferDocument = Offer & Document;

@Schema({ collection: "sale-offers", timestamps: true })
export class Offer {
  _id: Types.ObjectId;

  @Prop({ type: Number, index: true, unique: true })
  no: number;

  @Prop({ type: String, index: true })
  pipelineRef: string;

  @Prop({ type: String, default: "" })
  leadId: string;

  @Prop({ type: String, required: true, index: true })
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
    index: true,
  })
  status: string;

  @Prop({ type: OfferConversionInfo, default: () => ({}) })
  conversionInfo: OfferConversionInfo;

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
