import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type SoftwareProductDocument = SoftwareProduct & Document;

@Schema({ collection: "software-product", timestamps: true })
export class SoftwareProduct {
  _id: Types.ObjectId;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: "" })
  friendlyName: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ default: "" })
  erpId: string;

  @Prop({ default: "" })
  pid: string;

  @Prop({ default: 0 })
  purchasePrice: number;

  @Prop({ default: 0 })
  salePrice: number;

  @Prop({ default: 20 })
  vatRate: number;

  @Prop({ default: "usd" })
  currency: string;

  @Prop({ default: "module" })
  type: string;

  @Prop({ default: false })
  isSaas: boolean;

  @Prop({ default: true })
  saleActive: boolean;

  @Prop({ default: "AD" })
  unit: string;

  @Prop({ default: "" })
  nameWithCode: string;

  @Prop({ type: Date })
  editDate: Date;

  @Prop({ default: "" })
  editUser: string;
}

export const SoftwareProductSchema = SchemaFactory.createForClass(SoftwareProduct);

// Indexes for better query performance
SoftwareProductSchema.index({ id: 1 });
SoftwareProductSchema.index({ erpId: 1 });
SoftwareProductSchema.index({ type: 1 });
SoftwareProductSchema.index({ isSaas: 1 });
SoftwareProductSchema.index({ saleActive: 1 });
SoftwareProductSchema.index({ name: "text", friendlyName: "text", description: "text" });
