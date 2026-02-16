import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type EInvoicePriceDocument = EInvoicePrice & Document & AuditFields;

@Schema({ collection: "price-list-e-invoice", timestamps: true })
export class EInvoicePrice {
  _id: Types.ObjectId;

  @Prop({ required: true, index: true })
  id: string;

  @Prop({ default: 0 })
  sequence: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  erpId: string;

  @Prop({ default: 0 })
  unitPrice: number;

  @Prop({ default: 0 })
  discountRate: number;

  @Prop({ default: 0 })
  quantity: number;

  @Prop({ default: 0 })
  totalPrice: number;

  @Prop({ default: false })
  isCredit: boolean;

  @Prop({ default: "" })
  customerErpId: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  creatorId?: string;

  @Prop()
  updaterId?: string;
}

export const EInvoicePriceSchema =
  SchemaFactory.createForClass(EInvoicePrice);

EInvoicePriceSchema.index({ customerErpId: 1 });
EInvoicePriceSchema.index({ erpId: 1 });
