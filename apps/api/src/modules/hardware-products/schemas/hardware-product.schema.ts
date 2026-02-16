import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type HardwareProductDocument = HardwareProduct & Document & AuditFields;

@Schema({ collection: "hardware-product", timestamps: true })
export class HardwareProduct {
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

  @Prop({ default: 0 })
  purchasePrice: number;

  @Prop({ default: 0 })
  salePrice: number;

  @Prop({ default: 20 })
  vatRate: number;

  @Prop({ default: "usd" })
  currency: string;

  @Prop({ default: "usd" })
  purchaseCurrency: string;

  @Prop({ default: "usd" })
  saleCurrency: string;

  @Prop({ default: true })
  saleActive: boolean;

  @Prop({ default: "AD" })
  unit: string;

  @Prop({ type: Date })
  editDate: Date;

  @Prop({ default: "" })
  editUser: string;

  @Prop({ default: "" })
  updaterId: string;
}

export const HardwareProductSchema = SchemaFactory.createForClass(HardwareProduct);

// Indexes for better query performance
HardwareProductSchema.index({ id: 1 });
HardwareProductSchema.index({ erpId: 1 });
HardwareProductSchema.index({ saleActive: 1 });
HardwareProductSchema.index({ name: "text", friendlyName: "text", description: "text" });
