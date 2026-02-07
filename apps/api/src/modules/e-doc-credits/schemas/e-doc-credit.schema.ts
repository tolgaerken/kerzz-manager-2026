import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type EDocCreditDocument = EDocCredit & Document;

@Schema({ collection: "digital-invoice-credit", timestamps: false })
export class EDocCredit {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true, index: true })
  erpId: string;

  @Prop()
  customerId: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 1 })
  count: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: "tl" })
  currency: string;

  @Prop()
  internalFirm: string;

  @Prop()
  date: Date;

  @Prop()
  invoiceNumber: string;

  @Prop()
  invoiceUUID: string;

  @Prop()
  invoiceDate: Date;

  @Prop({ default: 0 })
  grandTotal: number;

  @Prop({ default: 0 })
  taxTotal: number;

  @Prop()
  invoiceNo: string;

  @Prop()
  editDate: Date;

  @Prop()
  editUser: string;

  @Prop()
  creatorId: string;
}

export const EDocCreditSchema = SchemaFactory.createForClass(EDocCredit);
EDocCreditSchema.index({ erpId: 1 });
EDocCreditSchema.index({ date: -1 });
