import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type SaleDocument = Sale & Document & AuditFields;

@Schema({ _id: false })
export class SaleStageHistory {
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

@Schema({ collection: "sales", timestamps: true })
export class Sale {
  _id: Types.ObjectId;

  @Prop({ type: String, default: "" })
  id: string;

  @Prop({ type: Number, index: true, unique: true })
  no: number;

  @Prop({ type: String })
  pipelineRef: string;

  @Prop({ type: String, default: "" })
  offerId: string;

  @Prop({ type: String, default: "" })
  leadId: string;

  @Prop({ type: String, required: true })
  customerId: string;

  @Prop({ type: String, default: "" })
  customerName: string;

  @Prop({ type: Date, default: () => new Date() })
  saleDate: Date;

  @Prop({ type: Date })
  implementDate: Date;

  @Prop({ type: String, default: "" })
  sellerId: string;

  @Prop({ type: String, default: "" })
  sellerName: string;

  // Toplamlar (backend hesaplar)
  @Prop({ type: Object, default: {} })
  totals: Record<string, any>;

  @Prop({ type: Number, default: 0 })
  grandTotal: number;

  @Prop({ type: Number, default: 0 })
  hardwareTotal: number;

  @Prop({ type: Number, default: 0 })
  saasTotal: number;

  @Prop({ type: Number, default: 0 })
  softwareTotal: number;

  @Prop({ type: Number, default: 0 })
  total: number;

  @Prop({ type: Number, default: 0 })
  usdRate: number;

  @Prop({ type: Number, default: 0 })
  eurRate: number;

  @Prop({
    type: String,
    default: "pending",
    enum: [
      "pending",
      "collection-waiting",
      "setup-waiting",
      "training-waiting",
      "active",
      "completed",
      "cancelled",
    ],
  })
  status: string;

  @Prop({ type: Boolean, default: false })
  approved: boolean;

  @Prop({ type: String, default: "" })
  approvedBy: string;

  @Prop({ type: String, default: "" })
  approvedByName: string;

  @Prop({ type: Date })
  approvedAt: Date;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ type: String, default: "" })
  notes: string;

  @Prop({ type: String, default: "" })
  internalFirm: string;

  @Prop({ type: [SaleStageHistory], default: [] })
  stageHistory: SaleStageHistory[];

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);

SaleSchema.index({ pipelineRef: 1 });
SaleSchema.index({ customerId: 1 });
SaleSchema.index({ status: 1 });
SaleSchema.index({ offerId: 1 });
