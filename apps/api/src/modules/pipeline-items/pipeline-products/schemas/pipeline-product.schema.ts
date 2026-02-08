import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PipelineProductDocument = PipelineProduct & Document;

@Schema({ collection: "pipeline-products", timestamps: true })
export class PipelineProduct {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  parentId: string;

  @Prop({ type: String, required: true, enum: ["offer", "sale"], index: true })
  parentType: string;

  @Prop({ type: String, index: true })
  pipelineRef: string;

  @Prop({ type: String })
  catalogId: string;

  @Prop({ type: String, default: "" })
  erpId: string;

  @Prop({ type: String, default: "" })
  name: string;

  @Prop({ type: String, default: "" })
  description: string;

  @Prop({ type: Number, default: 1 })
  qty: number;

  @Prop({ type: String, default: "AD" })
  unit: string;

  @Prop({ type: Number, default: 0 })
  purchasePrice: number;

  @Prop({ type: Number, default: 0 })
  salePrice: number;

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: String, default: "usd" })
  currency: string;

  @Prop({ type: String, default: "usd" })
  saleCurrency: string;

  @Prop({ type: Number, default: 20 })
  vatRate: number;

  @Prop({ type: Number, default: 0 })
  discountRate: number;

  @Prop({ type: Number, default: 0 })
  discountTotal: number;

  @Prop({ type: Number, default: 0 })
  taxTotal: number;

  @Prop({ type: Number, default: 0 })
  subTotal: number;

  @Prop({ type: Number, default: 0 })
  grandTotal: number;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const PipelineProductSchema =
  SchemaFactory.createForClass(PipelineProduct);

PipelineProductSchema.index({ parentId: 1, parentType: 1 });
PipelineProductSchema.index({ pipelineRef: 1 });
